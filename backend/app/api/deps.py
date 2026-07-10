from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings
from app.schemas.user import TokenData
from app.db.connection import get_db_connection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role is None:
            raise credentials_exception
        token_data = TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, email, role, is_active FROM users WHERE email = %s", (token_data.email,))
            user = cur.fetchone()
            if user is None:
                raise credentials_exception
            return {
                "id": user[0],
                "email": user[1],
                "role": user[2],
                "is_active": user[3]
            }

def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user["is_active"]:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_active_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires {required_role} role."
            )
        return current_user
    return role_checker
