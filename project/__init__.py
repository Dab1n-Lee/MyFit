from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_required, current_user, login_user, logout_user

from project import config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app():
    application = Flask(__name__)
    application.config.from_object(config)

    db.init_app(application)
    migrate.init_app(application, db)
    login_manager.init_app(application)
    
    login_manager.login_view = 'auth.login' 
    login_manager.login_message="로그인이 필요합니다."
    login_manager.login_message_category = "danger"
    login_manager.session_protection = "strong"


    

    @application.route("/")
    def index():
        return render_template("login.html")
    
    from project.utils.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    @login_manager.unauthorized_handler
    def unauthorized():
        # 로그아웃 후 로그인 페이지로 리다이렉트
        return redirect(url_for('auth.login'))
    
    from project.auth import auth
    from project.body import body
    application.register_blueprint(auth.bp)
    application.register_blueprint(body.bp)
    
    return application