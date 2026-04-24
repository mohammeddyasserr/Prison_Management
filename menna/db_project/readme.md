how to run the app:
cd menna
cd db_project
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt --no-user
uvicorn main:app --reload