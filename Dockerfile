# FROM node:14.17.3-alpine3.14

# RUN addgroup -S group && adduser -S user -G group
# # RUN user add -ms /bin/bash user
# USER user

# WORKDIR /home/user

# COPY package*.json ./
# RUN npm install

# COPY . .

# CMD ["npm","start"]

# 
FROM python:3.9
RUN useradd -ms /bin/bash user
USER user

WORKDIR /home/user
COPY requirements.txt .
# 
RUN pip install --no-cache-dir --upgrade -r requirements.txt && rm requirements.txt

# 
COPY . .

# 
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
