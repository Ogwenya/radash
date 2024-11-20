import os
import mysql.connector
import docker
import time
import logging
from datetime import datetime


logging.basicConfig(
    filename="./radius_reload.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


def send_hup_signal(nas_ip):
    try:
        client = docker.from_env()

        container = client.containers.get("freeradius")

        container.kill(signal="HUP")

        logging.info(f"Successfully sent HUP signal to FreeRADIUS for NAS IP {nas_ip}")
        return True
    except docker.errors.NotFound:
        logging.error(f"FreeRADIUS container not found for NAS IP {nas_ip}")
        return False
    except Exception as e:
        logging.error(f"Error sending HUP signal to NAS IP {nas_ip}: {e}")
        return False


def check_reload():
    try:

        conn = mysql.connector.connect(
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            host=os.getenv("DATABASE_HOST"),
            database=os.getenv("MYSQL_DATABASE"),
            port=os.getenv("DATABASE_PORT"),
        )

        cursor = conn.cursor()

        cursor.execute("SELECT id, nas_ip FROM radiusreload")

        rows = cursor.fetchall()

        if len(rows) > 0:
            for row in rows:
                id, nas_ip = row

                success = send_hup_signal(nas_ip)

                if success:

                    cursor.execute("DELETE FROM radiusreload WHERE id = %s", (id,))
                    conn.commit()
        else:
            logging.info(f"Database is empty, nothing to")

        cursor.close()
        conn.close()

    except Exception as e:

        logging.error(f"Database error: {e}")


if __name__ == "__main__":
    while True:
        check_reload()

        time.sleep(300)
