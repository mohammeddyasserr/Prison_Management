import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "prison.db")

def check_releases():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Query for inmates whose release date has come
    inmates_query = """
        SELECT i.inmate_id
        FROM inmate i
        LEFT JOIN legal_case lc ON i.inmate_id = lc.inmate_id
        WHERE i.status != 'Released'
        GROUP BY i.inmate_id
        HAVING date(i.start_date,
             '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
             '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
             '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') <= date('now')
    """
    
    cursor.execute(inmates_query)
    inmates_to_release = cursor.fetchall()
    
    if inmates_to_release:
        print(f"Found {len(inmates_to_release)} inmates to release.")
        for (inmate_id,) in inmates_to_release:
            cursor.execute("""
                UPDATE inmate
                SET assigned_cell = NULL, assigned_prison = NULL, status = 'Released'
                WHERE inmate_id = ?
            """, (inmate_id,))
            
            # Delete pending transfers
            cursor.execute("""
                DELETE FROM transfer
                WHERE inmate_id = ? AND status = 'Pending'
            """, (inmate_id,))
            
            # Delete upcoming visits
            cursor.execute("""
                DELETE FROM visit
                WHERE inmate_id = ? AND visit_date >= date('now')
            """, (inmate_id,))
            
            print(f"Released inmate ID: {inmate_id}")
    else:
        print("No inmates to release.")

    # Query for pending inmates whose release date has come
    pending_query = """
        SELECT pi.pending_inmate_id
        FROM pending_inmate pi
        LEFT JOIN legal_case lc ON pi.pending_inmate_id = lc.inmate_id
        WHERE pi.status != 'Released'
        GROUP BY pi.pending_inmate_id
        HAVING date(pi.start_date,
             '+' || COALESCE(SUM(lc.sentence_duration_years), 0) || ' years',
             '+' || COALESCE(SUM(lc.sentence_duration_months), 0) || ' months',
             '+' || COALESCE(SUM(lc.sentence_duration_days), 0) || ' days') <= date('now')
    """

    cursor.execute(pending_query)
    pending_to_release = cursor.fetchall()

    if pending_to_release:
        print(f"Found {len(pending_to_release)} pending inmates to release.")
        for (pending_inmate_id,) in pending_to_release:
            cursor.execute("""
                UPDATE pending_inmate
                SET assigned_prison = NULL, status = 'Released'
                WHERE pending_inmate_id = ?
            """, (pending_inmate_id,))
            
            # Delete pending transfers
            cursor.execute("""
                DELETE FROM transfer
                WHERE inmate_id = ? AND status = 'Pending'
            """, (pending_inmate_id,))
            
            # Delete upcoming visits
            cursor.execute("""
                DELETE FROM visit
                WHERE inmate_id = ? AND visit_date >= date('now')
            """, (pending_inmate_id,))
            
            print(f"Released pending inmate ID: {pending_inmate_id}")
    else:
        print("No pending inmates to release.")

    conn.commit()
    conn.close()
    print("Release check complete.")

if __name__ == "__main__":
    check_releases()
