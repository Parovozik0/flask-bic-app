from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f"<User {self.name}>"

class Container(db.Model):
    __tablename__ = 'containers'

    number = db.Column(db.Text, primary_key=True, nullable=False)
    location = db.Column(db.Text, nullable=True)
    KP = db.Column(db.Text, db.ForeignKey('KPs.number'), nullable=True)
    booking = db.Column(db.Text, db.ForeignKey('bookings.number'), nullable=True)
    status = db.Column(db.Text, nullable=True)
    delivery_date = db.Column(db.Date, nullable=True)
    pickup_date = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    chronology = db.Column(db.Text, nullable=True)
    
    booking_relation = db.relationship('Booking', backref='containers', lazy=True)
    KP_relation = db.relationship('KP', backref='containers', lazy=True)

    def __repr__(self):
        return f"<Container {self.number}>"

class Booking(db.Model):
    __tablename__ = 'bookings'

    number = db.Column(db.Text, primary_key=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Booking {self.number}>"

class KP(db.Model):
    __tablename__ = 'KPs'

    number = db.Column(db.Text, primary_key=True, nullable=False)
    location = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<KP {self.number}>"
