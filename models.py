from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy import CheckConstraint

db = SQLAlchemy()

# Определение ENUM для статуса контейнера
container_status = ENUM(
    'В Китае', 'Направлен в Россию', 'В России', 'Направлен в Китай',
    name='container_status', create_type=True
)

class KP(db.Model):
    __tablename__ = 'KPs'
    number = db.Column(db.Text, primary_key=True, nullable=False)
    location = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<KP {self.number}>"

class Booking(db.Model):
    __tablename__ = 'bookings'
    number = db.Column(db.Text, primary_key=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    lading = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Booking {self.number}>"

class Container(db.Model):
    __tablename__ = 'containers'
    number = db.Column(db.Text, primary_key=True, nullable=False)
    location = db.Column(db.Text, nullable=True)
    KP = db.Column(db.Text, db.ForeignKey('KPs.number', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    booking = db.Column(db.Text, db.ForeignKey('bookings.number', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    status = db.Column(container_status, nullable=True, default='В Китае')
    delivery_date = db.Column(db.Date, nullable=True)
    pickup_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    chronology = db.Column(db.Text, nullable=True)
    
    booking_relation = db.relationship('Booking', backref='containers', lazy=True)
    KP_relation = db.relationship('KP', backref='containers', lazy=True)
    
    __table_args__ = (
        CheckConstraint("number ~ '^[A-Z]{4}[0-9]{7}$'::text", name='valid_container_number'),
    )

    def __repr__(self):
        return f"<Container {self.number}>"