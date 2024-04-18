import re
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from flask_login import LoginManager, login_user, login_required, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_bcrypt import Bcrypt
from models import db, User 
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://///Users/sankethmadduri/Desktop/Lechero/database.db'
app.config['SECRET_KEY'] = 'lecherocustomerdata'
db.init_app(app)
migrate = Migrate(app, db)

bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

try:
    with app.app_context():
        db.create_all()
except Exception as e:
    print("Error creating tables:", e)
    
class RegisterForm(FlaskForm):
    firstname = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "firstname"})
    lastname = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "lastname"})
    email = StringField(validators=[
                           InputRequired(), Length(min=4, max=50)], render_kw={"placeholder": "email"})
    phoneno = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "phoneno"})

    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    
    submit = SubmitField('Register')
    
    def validate_email(self, email):
        existing_user_email = User.query.filter_by(email=email.data).first()
        if existing_user_email:
            raise ValidationError('This email is already in use. Please choose a different one.')

        if not re.match(r'\b[A-Za-z0-9._%+-]+@(?:gmail)\.com\b', email.data):
            raise ValidationError('Please enter a valid email address')
                
class LoginForm(FlaskForm):
    email = StringField(validators=[
                           InputRequired(), Length(min=4, max=50)], render_kw={"placeholder": "email"})

    password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})

    submit = SubmitField('Login')

@app.route('/')
def index():
    return redirect(url_for('home'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()

    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(
            firstname=form.firstname.data,
            lastname=form.lastname.data,
            email=form.email.data,
            phoneno=form.phoneno.data,  
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    error = None  
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('welcome'))
            else:
                error = 'Invalid password'  
        else:
            error = 'Invalid email'  

    return render_template('login.html', form=form, error=error)

@app.route('/welcome')
@login_required
def welcome():
    return render_template('welcome.html')

@app.route('/home')
def home():
    return render_template('home.html')




@app.route('/cart')
@login_required
def cart():

    return render_template('cart.html')

@app.route('/checkout', methods=['POST'])
@login_required
def checkout():
    data = request.json
    cart = data.get('cart')
    deliveryTime = data.get('deliveryTime')
    
    current_user.order_details = {'cart': cart, 'deliveryTime': deliveryTime}
    db.session.commit()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
