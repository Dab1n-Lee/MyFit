import os

SECRET_KEY=os.urandom(32)

BASE_DIR = os.path.dirname(__file__)

db = {
	'user' : 'dlog', # 데이터베이스 유저명
    'password' : 'dlog1234!', # 비밀번호
    'host' : 'dlog-test.c9y8giyw2il1.ap-northeast-2.rds.amazonaws.com', # 호스트
    'port' : 3306, #포트
    'database' : 'myfit' # 데이터베이스 명
}

BASE_DIR=os.path.dirname(__file__)
SQLALCHEMY_DATABASE_URI= f"mysql+mysqlconnector://{db['user']}:{db['password']}@{db['host']}:{db['port']}/{db['database']}?charset=utf8"
SQLALCHEMY_TRACK_MODIFICATION=False

#"sqlite:///{}".format(os.path.join(BASE_DIR,"dlog.db"))