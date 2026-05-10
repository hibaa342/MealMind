from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(prefix="/api/planning", tags=["planning"])

@router.get("/", response_model=List[schemas.MealPlan])
def get_user_plan(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.MealPlan).filter(models.MealPlan.user_id == current_user.id).all()

@router.post("/")
def add_meal_to_plan(plan: schemas.MealPlanCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    db_plan = models.MealPlan(**plan.dict(), user_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/{plan_id}")
def remove_meal_from_plan(plan_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    plan = db.query(models.MealPlan).filter(models.MealPlan.id == plan_id, models.MealPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"status": "success"}