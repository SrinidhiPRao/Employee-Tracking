from fastapi import APIRouter, HTTPException, Depends
from auth.utils import get_current_user
from db import get_connection
from .schemas import PayrollRequest
import calendar

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.post("/calculate", status_code=201)
def calculate_payroll(data: PayrollRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("hr", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, salary FROM employees WHERE id = %s", (data.employee_id,))
    employee = cursor.fetchone()
    if not employee:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")

    base_salary = float(employee["salary"])
    total_days = calendar.monthrange(data.year, data.month)[1]

    cursor.execute(
        """SELECT COUNT(*) as present_days FROM attendance
           WHERE employee_id = %s AND MONTH(date) = %s AND YEAR(date) = %s""",
        (data.employee_id, data.month, data.year)
    )
    present_days = cursor.fetchone()["present_days"]

    cursor.execute(
        """SELECT COALESCE(SUM(overtime_hours), 0) AS total_overtime
           FROM attendance
           WHERE employee_id = %s AND MONTH(date) = %s AND YEAR(date) = %s""",
        (data.employee_id, data.month, data.year)
    )
    total_overtime = float(cursor.fetchone()["total_overtime"])

    hourly_rate = base_salary / (total_days * 8)
    overtime_pay = round(hourly_rate * total_overtime, 2)
    deduction = (base_salary / total_days) * (total_days - present_days)
    net_salary = base_salary - deduction + overtime_pay

    cursor.execute(
        "DELETE FROM payroll WHERE employee_id = %s AND month = %s AND year = %s",
        (data.employee_id, data.month, data.year)
    )
    cursor.execute(
        """INSERT INTO payroll (employee_id, month, year, basic_salary, deductions, overtime_hours, overtime_pay, net_salary)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (data.employee_id, data.month, data.year, base_salary, round(deduction, 2), total_overtime, overtime_pay, round(net_salary, 2))
    )
    conn.commit()

    cursor.execute(
        "SELECT * FROM payroll WHERE employee_id = %s AND month = %s AND year = %s",
        (data.employee_id, data.month, data.year)
    )
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result


@router.get("/my-payroll")
def my_payroll(current_user: dict = Depends(get_current_user)):
    employee_id = int(current_user["sub"])

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM payroll WHERE employee_id = %s ORDER BY year DESC, month DESC",
        (employee_id,)
    )
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records


@router.get("/slip/{employee_id}")
def get_slip_for_employee(employee_id: int, month: int, year: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("hr", "admin"):
        raise HTTPException(status_code=403, detail="Access denied. HR or Admin only.")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, email, department FROM employees WHERE id = %s",
        (employee_id,)
    )
    employee = cursor.fetchone()
    if not employee:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")

    cursor.execute(
        "SELECT * FROM payroll WHERE employee_id = %s AND month = %s AND year = %s",
        (employee_id, month, year)
    )
    payroll = cursor.fetchone()
    cursor.close()
    conn.close()

    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not yet calculated for this period")

    return {
        "employee": employee,
        "period": {"month": month, "year": year},
        "earnings": {
            "basic_salary": payroll["basic_salary"],
            "overtime_pay": payroll["overtime_pay"],
            "overtime_hours": payroll["overtime_hours"]
        },
        "deductions": payroll["deductions"],
        "net_salary": payroll["net_salary"]
    }


@router.get("/my-slip")
def get_my_slip(month: int, year: int, current_user: dict = Depends(get_current_user)):
    employee_id = int(current_user["sub"])

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, name, email, department FROM employees WHERE id = %s",
        (employee_id,)
    )
    employee = cursor.fetchone()

    cursor.execute(
        "SELECT * FROM payroll WHERE employee_id = %s AND month = %s AND year = %s",
        (employee_id, month, year)
    )
    payroll = cursor.fetchone()
    cursor.close()
    conn.close()

    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not yet calculated for this period")

    return {
        "employee": employee,
        "period": {"month": month, "year": year},
        "earnings": {
            "basic_salary": payroll["basic_salary"],
            "overtime_pay": payroll["overtime_pay"],
            "overtime_hours": payroll["overtime_hours"]
        },
        "deductions": payroll["deductions"],
        "net_salary": payroll["net_salary"]
    }