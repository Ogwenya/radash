FROM python:alpine

WORKDIR /app

RUN touch radius_reload.log

RUN pip install mysql-connector-python
RUN pip install docker

COPY . .

CMD ["python3", "radius_reload.py"]