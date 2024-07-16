from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, RadioField, SubmitField
from wtforms.validators import DataRequired, EqualTo, Length

class RegistrationForm(FlaskForm):
    user_id = StringField('사용자 ID', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('비밀번호', validators=[DataRequired(), Length(min=6, max=255)])
    confirm_password = PasswordField('비밀번호 확인', validators=[DataRequired(), EqualTo('password')])
    nickname = StringField('이름(닉네임)', validators=[DataRequired(), Length(min=2, max=20)])
    birthdate = StringField('생년월일 (ex) 990120', validators=[DataRequired(), Length(min=6, max=6)])
    gender = RadioField('성별', choices=[('0', '남'), ('1', '여')], validators=[DataRequired()])
    submit = SubmitField('MyFit')
