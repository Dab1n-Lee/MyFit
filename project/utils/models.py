from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy import CheckConstraint
from datetime import datetime
from project import db

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(20), nullable=False)
    gender = db.Column(db.Integer, CheckConstraint('gender IN (0, 1)'), nullable=False)  # TinyInt(1)
    birthdate = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())


class BodyInfo(db.Model):
    __tablename__ = 'body_info'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    height = db.Column(db.String(255), nullable=False)
    weight = db.Column(db.String(255), nullable=False)
    waist = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
