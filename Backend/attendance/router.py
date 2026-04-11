from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, time
from auth.utils import get_current_user
from db import get_connection

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/mark", status_code=201)
def mark_attendance(current_user: dict = Depends(get_current_user)):
    employee_id = int(current_user["sub"])
    now = datetime.now()
    today = now.date()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM attendance WHERE employee_id = %s AND date = %s",
        (employee_id, today)
    )
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Attendance already marked for today")

    cursor.execute(
        "INSERT INTO attendance (employee_id, date, check_in, status) VALUES (%s, %s, %s, %s)",
        (employee_id, today, now, "present")
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "message": "Attendance marked successfully",
        "employee_id": employee_id,
        "check_in": now,
        "date": today
    }


# Change this variable when the official start time is decided
LATE_THRESHOLD = time(9, 0, 0)  # 09:00 AM


def _query_late_records(employee_id=None):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT
            a.id,
            a.employee_id,
            e.name AS employee_name,
            e.department,
            a.date,
            a.check_in,
            TIMEDIFF(TIME(a.check_in), %s) AS late_by
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        WHERE TIME(a.check_in) > %s
    """
    params = [LATE_THRESHOLD.strftime("%H:%M:%S"), LATE_THRESHOLD.strftime("%H:%M:%S")]

    if employee_id is not None:
        query += " AND a.employee_id = %s"
        params.append(employee_id)

    query += " ORDER BY a.date DESC"

    cursor.execute(query, params)
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records


@router.get("/late-mark/all")
def get_all_late_marks(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("hr", "admin"):
        raise HTTPException(status_code=403, detail="Access denied. HR or Admin only.")

    records = _query_late_records()
    return {
        "late_threshold": LATE_THRESHOLD.strftime("%H:%M"),
        "total_late_records": len(records),
        "records": records
    }


@router.get("/late-mark/me")
def get_my_late_marks(current_user: dict = Depends(get_current_user)):
    employee_id = int(current_user["sub"])
    records = _query_late_records(employee_id=employee_id)
    return {
        "employee_id": employee_id,
        "late_threshold": LATE_THRESHOLD.strftime("%H:%M"),
        "total_late_records": len(records),
        "records": records
    }