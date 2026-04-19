how to run the app:
cd menna
cd db_project
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload