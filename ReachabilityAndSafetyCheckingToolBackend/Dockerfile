FROM python:3.9-slim

WORKDIR /app

COPY . .

RUN chmod +x /app/its-reach

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 7050

CMD ["python", "its_tool_be.py"]



# docker build --platform linux/amd64 -t ipranavprashant/reachabilityandsafetycheckingtoolbackend .
# docker push ipranavprashant/reachabilityandsafetycheckingtoolbackend
# docker inspect ipranavprashant/reachabilityandsafetycheckingtoolbackend | grep Architecture


