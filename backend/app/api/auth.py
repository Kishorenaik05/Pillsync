from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg2.errors import UniqueViolation

from app.schemas.user import UserCreate, UserResponse, Token
from app.db.connection import get_db_connection
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    hashed_password = get_password_hash(user_in.password)
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    """
                    INSERT INTO users (email, hashed_password, role)
                    VALUES (%s, %s, %s)
                    RETURNING id, email, role, is_active, created_at, updated_at
                    """,
                    (user_in.email, hashed_password, user_in.role.upper())
                )
                new_user = cur.fetchone()
                conn.commit()
                return {
                    "id": new_user[0],
                    "email": new_user[1],
                    "role": new_user[2],
                    "is_active": new_user[3],
                    "created_at": new_user[4],
                    "updated_at": new_user[5]
                }
            except UniqueViolation:
                conn.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, email, hashed_password, role FROM users WHERE email = %s", (form_data.username,))
            user = cur.fetchone()
            if not user or not verify_password(form_data.password, user[2]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user[1], "role": user[3]}, expires_delta=access_token_expires
            )
            return {"access_token": access_token, "token_type": "bearer"}
