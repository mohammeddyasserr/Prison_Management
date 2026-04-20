how to run the app:
python -m venv venv
venv\Scripts\activate

how to run menna app:
cd menna
cd db_project
pip install -r requirements.txt
uvicorn main:app --reload