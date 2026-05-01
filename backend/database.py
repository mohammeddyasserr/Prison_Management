from typing import Annotated
from fastapi import Depends
from sqlmodel import  Session, SQLModel, create_engine
import os
import subprocess



sqlite_file_name = "../prison.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)



def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

def create_db_and_tables():
    # Path to the initialize.py script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    init_script_path = os.path.join(os.path.dirname(current_dir), "database", "initialize.py")
    
    # Run the initialize.py script
    try:
        subprocess.run(["python", init_script_path], check=True)
        print("Database initialized successfully via initialize.py!")
    except subprocess.CalledProcessError as e:
        print(f"Failed to initialize database: {e}")

