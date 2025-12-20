from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = FAISS.load_local(
    "faiss_index",
    embeddings,
    allow_dangerous_deserialization=True  # YOU created this file, safe
)

def query_faiss(question: str):
    results = db.similarity_search(question, k=3)
    return [r.page_content for r in results]


if __name__ == "__main__":
    q = "How did Beijing reduce transport emissions?"
    answers = query_faiss(q)

    for i, a in enumerate(answers):
        print(f"\n--- Result {i+1} ---\n")
        print(a[:800])
