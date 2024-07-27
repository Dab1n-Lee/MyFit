from flask import Blueprint, render_template, redirect, url_for, request, flash, abort
from flask_login import login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from ..utils.models import User
from ..forms.auth_forms import RegistrationForm
from project import db

# auth에 해당하는 라우팅 함수들.
bp = Blueprint('auth', __name__, url_prefix="/")

@bp.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if request.method == 'POST':
        print('접근')   
        if form.validate_on_submit():
            existing_user = User.query.filter_by(user_id=form.user_id.data).first()
            if existing_user:
                flash('This user ID is already taken.')
                return redirect(url_for('auth.register'))

            hashed_password = generate_password_hash(form.password.data)
            new_user = User(
                user_id=form.user_id.data,
                password=hashed_password,
                nickname=form.nickname.data,
                gender=int(form.gender.data),
                birthdate=form.birthdate.data
            )
            db.session.add(new_user)
            db.session.commit()
            flash('You have successfully registered! Please log in.')
            return redirect(url_for('auth.login'))
        else:
            flash('Form validation failed. Please check your inputs.')
    
    return render_template('register.html', form=form)


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile', nickname=current_user.nickname))  # 'profile'을 'auth.profile'으로 수정

    if request.method == 'POST':
        user_id = request.form['id']
        password = request.form['password']
        user = User.query.filter_by(user_id=user_id).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('auth.profile', nickname=user.nickname))  # 'profile'을 'auth.profile'으로 수정
        return 'Invalid nickname or password'
    return render_template('login.html')


@bp.route('/add_user_info/<int:user_id>', methods=['GET', 'POST'])
def add_user_info(user_id):
    if user_id != current_user.id:
        abort(403)  # 403 Forbidden 에러를 발생시켜 접근을 차단
    user = User.query.get_or_404(user_id)
    user_info = UserInfo.query.filter_by(user_id=user_id).first()
    if user_info:
        # 이미 상세정보가 존재하면 조회 페이지로 리다이렉트
        return redirect(url_for('auth.view_user_info', user_id=user_id))

    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        
        user_info = UserInfo(name=name, email=email, phone=phone, user_id=user_id)
        db.session.add(user_info)
        db.session.commit()
        
        return redirect(url_for('auth.view_user_info', user_id=user_id))
    
    return render_template('index.html', user=user)

@bp.route('/<nickname>')
@login_required
def profile(nickname):
    if nickname != current_user.nickname:
        abort(403)
    return render_template('index.html', nickname=nickname)




@bp.route('/profile_info/<int:user_id>')
def view_user_info(user_id):
    if user_id != current_user.id:
        abort(403)
    user = User.query.get_or_404(user_id)
    user_info = UserInfo.query.filter_by(user_id=user_id).first()
    return render_template('view_user_info.html', user=user, user_info=user_info)

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))  # 'login'을 'auth.login'으로 수정