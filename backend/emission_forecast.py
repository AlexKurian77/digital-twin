"""
Emission Forecasting API Routes
Random Forest model for CO2 emission forecasting
"""
from flask import jsonify, request
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from datetime import datetime
import os

# Global model instance
_forecaster = None

class EmissionForecaster:
    def __init__(self, data_path='new_daily_emissions_column_format.xlsx'):
        self.data_path = data_path
        self.model = None
        self.df_features = None
        self.feature_cols = None
        self.avg_sectors = None
        self.metrics = {}
        self.n_lags = 14
        self.target_col = 'Total Emissions'
        self.sector_cols = ['Aviation (%)', 'Ground Transport (%)', 'Industry (%)', 'Power (%)', 'Residential (%)']
        
        if os.path.exists(data_path):
            self._train_model()
    
    def _create_features(self, data):
        df_feat = data.copy()
        df_feat = df_feat.dropna(subset=['Date', self.target_col]).reset_index(drop=True)
        
        df_feat['day_of_week'] = df_feat['Date'].dt.dayofweek
        df_feat['day_of_month'] = df_feat['Date'].dt.day
        df_feat['month'] = df_feat['Date'].dt.month
        df_feat['week_of_year'] = df_feat['Date'].dt.isocalendar().week.fillna(1).astype(int)
        df_feat['is_weekend'] = (df_feat['day_of_week'] >= 5).astype(int)
        df_feat['quarter'] = df_feat['Date'].dt.quarter
        df_feat['day_sin'] = np.sin(2 * np.pi * df_feat['day_of_week'] / 7)
        df_feat['day_cos'] = np.cos(2 * np.pi * df_feat['day_of_week'] / 7)
        df_feat['month_sin'] = np.sin(2 * np.pi * df_feat['month'] / 12)
        df_feat['month_cos'] = np.cos(2 * np.pi * df_feat['month'] / 12)
        
        for lag in range(1, self.n_lags + 1):
            df_feat[f'lag_{lag}'] = df_feat[self.target_col].shift(lag)
        df_feat['lag_7_same_day'] = df_feat[self.target_col].shift(7)
        df_feat['lag_14_same_day'] = df_feat[self.target_col].shift(14)
        
        for window in [3, 7, 14]:
            df_feat[f'rolling_mean_{window}'] = df_feat[self.target_col].shift(1).rolling(window=window).mean()
            df_feat[f'rolling_std_{window}'] = df_feat[self.target_col].shift(1).rolling(window=window).std()
        
        df_feat['ema_7'] = df_feat[self.target_col].shift(1).ewm(span=7).mean()
        df_feat['diff_1'] = df_feat[self.target_col].diff(1)
        df_feat = df_feat.dropna().reset_index(drop=True)
        return df_feat
    
    def _train_model(self):
        df = pd.read_excel(self.data_path)
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
        df = df.sort_values('Date').reset_index(drop=True)
        df['Year'] = df['Date'].dt.year
        
        self.avg_sectors = df[self.sector_cols].mean().to_dict()
        self.df = df
        self.df_features = self._create_features(df)
        
        exclude_cols = ['Date', self.target_col, 'Year'] + self.sector_cols
        self.feature_cols = [col for col in self.df_features.columns if col not in exclude_cols]
        
        X = self.df_features[self.feature_cols].values
        y = self.df_features[self.target_col].values
        
        test_size = int(len(X) * 0.15)
        X_train, X_test = X[:-test_size], X[-test_size:]
        y_train, y_test = y[:-test_size], y[-test_size:]
        
        self.model = RandomForestRegressor(
            n_estimators=500, max_depth=20, max_features=0.5,
            oob_score=True, random_state=42, n_jobs=-1
        )
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        self.metrics = {
            'r2': round(r2_score(y_test, y_pred), 4),
            'mae': round(mean_absolute_error(y_test, y_pred), 4),
            'rmse': round(np.sqrt(mean_squared_error(y_test, y_pred)), 4)
        }
    
    def _forecast_daily(self, n_days):
        last_date = self.df_features['Date'].iloc[-1]
        recent = self.df_features[self.target_col].values[-max(self.n_lags, 14):].tolist()
        forecasts = []
        
        for step in range(1, n_days + 1):
            fd = pd.Timestamp(last_date) + pd.Timedelta(days=step)
            f = {
                'day_of_week': fd.dayofweek, 'day_of_month': fd.day, 'month': fd.month,
                'week_of_year': fd.isocalendar()[1], 'is_weekend': 1 if fd.dayofweek >= 5 else 0,
                'quarter': fd.quarter,
                'day_sin': np.sin(2 * np.pi * fd.dayofweek / 7),
                'day_cos': np.cos(2 * np.pi * fd.dayofweek / 7),
                'month_sin': np.sin(2 * np.pi * fd.month / 12),
                'month_cos': np.cos(2 * np.pi * fd.month / 12),
            }
            for lag in range(1, self.n_lags + 1):
                f[f'lag_{lag}'] = recent[-lag] if lag <= len(recent) else np.mean(recent)
            f['lag_7_same_day'] = recent[-7] if len(recent) >= 7 else np.mean(recent)
            f['lag_14_same_day'] = recent[-14] if len(recent) >= 14 else np.mean(recent)
            for w in [3, 7, 14]:
                wd = recent[-w:] if len(recent) >= w else recent
                f[f'rolling_mean_{w}'] = np.mean(wd)
                f[f'rolling_std_{w}'] = np.std(wd) if len(wd) > 1 else 0
            f['ema_7'] = pd.Series(recent).ewm(span=7).mean().iloc[-1]
            f['diff_1'] = recent[-1] - recent[-2] if len(recent) >= 2 else 0
            
            X_pred = np.array([f[col] for col in self.feature_cols]).reshape(1, -1)
            pred = self.model.predict(X_pred)[0]
            
            sector_breakdown = {
                k.replace(' (%)', '').replace(' ', '_'): round(pred * v / 100, 4)
                for k, v in self.avg_sectors.items()
            }
            
            forecasts.append({
                'date': fd.strftime('%Y-%m-%d'),
                'emission': round(pred, 4),
                'sectors': sector_breakdown
            })
            recent.append(pred)
        
        return forecasts
    
    def forecast_days(self, n_days):
        n_days = max(1, min(365, n_days))
        
        # Calculate gap from last data point to today
        last_date = self.df_features['Date'].iloc[-1]
        today = pd.Timestamp(datetime.now().date())
        days_gap = (today - last_date).days
        
        # If there is a gap, extend forecast to cover it + requested days
        total_days = n_days
        if days_gap > 0:
            total_days += days_gap
            
        forecasts = self._forecast_daily(total_days)
        
        # Determine history length: match n_days (requested forecast length)
        # Note: 'n_days' here is the requested length, 'total_days' includes gap fill.
        # User wants "previous 30 days if we choose 30", so we use original n_days.
        history_days = n_days
        
        # Get historical data
        history_data = []
        if self.df is not None and not self.df.empty:
            hist_df = self.df.tail(history_days)
            for _, row in hist_df.iterrows():
                # Calculate sector values from percentages
                sector_breakdown = {}
                for col in self.sector_cols:
                    sector_name = col.replace(' (%)', '').replace(' ', '_')
                    # If column exists in row, use it, otherwise use average
                    pct = row[col] if col in row else self.avg_sectors.get(col, 0)
                    sector_breakdown[sector_name] = round(row[self.target_col] * pct / 100, 4)

                history_data.append({
                    'date': row['Date'].strftime('%Y-%m-%d'),
                    'emission': round(row[self.target_col], 4),
                    'sectors': sector_breakdown,
                    'is_historical': True
                })

        return {
            'type': 'daily',
            'days': n_days,
            'forecasts': forecasts,
            'history': history_data,
            'metrics': self.metrics,
            'sector_percentages': {k.replace(' (%)', ''): round(v, 2) for k, v in self.avg_sectors.items()}
        }
    
    def forecast_years(self, n_years):
        n_years = max(1, min(3, n_years))
        n_days = 365 * (n_years + 1)
        daily = self._forecast_daily(n_days)
        
        # Historical yearly averages
        historical = self.df.groupby('Year')[self.target_col].mean().reset_index()
        
        # Forecasted yearly averages
        df_forecast = pd.DataFrame(daily)
        df_forecast['year'] = pd.to_datetime(df_forecast['date']).dt.year
        forecast_yearly = df_forecast[df_forecast['year'] >= 2026].groupby('year')['emission'].mean()
        forecast_yearly = forecast_yearly.head(n_years)
        
        years_data = []
        for _, row in historical.iterrows():
            years_data.append({
                'year': int(row['Year']),
                'avg_emission': round(row[self.target_col], 4),
                'type': 'historical'
            })
        
        for year, emission in forecast_yearly.items():
            sector_breakdown = {
                k.replace(' (%)', '').replace(' ', '_'): round(emission * v / 100, 4)
                for k, v in self.avg_sectors.items()
            }
            years_data.append({
                'year': int(year),
                'avg_emission': round(emission, 4),
                'type': 'forecast',
                'sectors': sector_breakdown
            })
        
        return {
            'type': 'yearly',
            'years': n_years,
            'data': years_data,
            'metrics': self.metrics,
            'sector_percentages': {k.replace(' (%)', ''): round(v, 2) for k, v in self.avg_sectors.items()}
        }


def get_forecaster():
    global _forecaster
    if _forecaster is None:
        _forecaster = EmissionForecaster()
    return _forecaster


def register_emission_routes(app):
    """Register emission forecast routes with Flask app."""
    
    @app.route('/api/emission/metrics', methods=['GET'])
    def emission_metrics():
        """Get model performance metrics."""
        try:
            forecaster = get_forecaster()
            return jsonify({
                'status': 'success',
                'metrics': forecaster.metrics,
                'sector_percentages': {k.replace(' (%)', ''): round(v, 2) for k, v in forecaster.avg_sectors.items()},
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/emission/forecast/days', methods=['POST'])
    def emission_forecast_days():
        """Forecast emissions for 1-365 days."""
        try:
            data = request.json or {}
            n_days = data.get('days', 30)
            
            forecaster = get_forecaster()
            result = forecaster.forecast_days(n_days)
            
            return jsonify({
                'status': 'success',
                **result,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/emission/forecast/years', methods=['POST'])
    def emission_forecast_years():
        """Forecast yearly averages for 1-3 years."""
        try:
            data = request.json or {}
            n_years = data.get('years', 1)
            
            forecaster = get_forecaster()
            result = forecaster.forecast_years(n_years)
            
            return jsonify({
                'status': 'success',
                **result,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500