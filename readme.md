how to run the app:
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

how to run menna app:
cd menna
cd db_project
uvicorn main:app --reload

how to run the test app:

how to set up database credentials:
Create a file named `.env` in the root directory of the project and add your MySQL database credentials like this:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=prison_db
```

uvicorn test:app --reload