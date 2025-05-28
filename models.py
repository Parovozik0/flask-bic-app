from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy import CheckConstraint

db = SQLAlchemy()

# Определение ENUM для статуса контейнера
container_status = ENUM(
    'В Китае', 'Направлен в Россию', 'В России', 'Направлен в Китай',
    name='container_status', create_type=True
)

# Определение ENUM для типа и размера контейнера
type_size = ENUM(
    '20COC', '20SOC', '40COC', '40SOC',
    name='type_size', create_type=True
)

class KP(db.Model):
    __tablename__ = 'KP'
    number = db.Column(db.Text, primary_key=True, nullable=False)

    def __repr__(self):
        return f"<KP {self.number}>"

class KPs(db.Model):
    __tablename__ = 'KPs'
    number = db.Column(db.Text, primary_key=True, nullable=False)
    location = db.Column(db.Text)
    notes = db.Column(db.Text)

    def __repr__(self):
        return f"<KPs {self.number}>"

class Booking(db.Model):
    __tablename__ = 'bookings'
    booking = db.Column(db.String, primary_key=True, nullable=False)
    internal_number = db.Column(db.String, nullable=False)
    line = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    vessel = db.Column(db.String, nullable=False)
    

    def __repr__(self):
        return f"<Booking {self.booking}>"

class Container(db.Model):
    __tablename__ = 'containers'
    number = db.Column(db.Text, primary_key=True, nullable=False)
    KP = db.Column(db.Text, db.ForeignKey('KP.number', onupdate='CASCADE', ondelete='SET NULL'))
    booking = db.Column(db.Integer)
    chronology = db.Column(db.Text)
    delivery_date = db.Column(db.Date)
    location = db.Column(db.Text)
    notes = db.Column(db.Text)
    pickup_date = db.Column(db.Date)
    status = db.Column(container_status)
    
    def __repr__(self):
        return f"<Container {self.number}>"

class InternalNumber(db.Model):
    __tablename__ = 'internal_numbers'
    internal_number = db.Column(db.String(20), primary_key=True, nullable=False)
    pod_direction = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    type_size = db.Column(type_size, nullable=True)
    cargo = db.Column(db.Text, nullable=False)
    pol_sending = db.Column(db.String(100))
    
    # Updated constraint to match PostgreSQL schema
    __table_args__ = (
        CheckConstraint(
            "internal_number ~ '^[A-Z0-9]+-[0-3][0-9][0-1][0-9][0-9]{4}$'", 
            name="valid_internal_number"
        ),
    )

    def __repr__(self):
        return f"<InternalNumber {self.internal_number}>"

class Lading(db.Model):
    __tablename__ = 'ladings'
    lading_number = db.Column(db.String, primary_key=True, nullable=False)
    booking = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Lading {self.lading_number}>"

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    email = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"