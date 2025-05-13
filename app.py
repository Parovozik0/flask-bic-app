from flask import Flask, request, jsonify, render_template, url_for, redirect, flash
import os
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from config import Config
from models import *
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import re
import pandas as pd
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config.from_object(Config)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['DEBUG'] = True

socketio = SocketIO(app, cors_allowed_origins="*")

print("SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])

db.init_app(app)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

with app.app_context():
    db.create_all()

@app.route('/')
def main():
    return redirect(url_for('container'))

@app.route('/container', methods=['GET', 'POST'])
def container():
    try:
        container_number = ''
        booking_number = ''
        KP_number = ''
        location = ''
        selected_option = request.args.get('option', 'option1')
        selected_value = '40/20'
        if selected_option == 'option2':
            selected_value = '40'
        elif selected_option == 'option3':
            selected_value = '20'

        if request.method == 'POST':
            container_number = request.form.get('container_number', '')
            booking_number = request.form.get('booking_number', '')
            KP_number = request.form.get('KP_number', '')
            location = request.form.get('location', '')

            query = "SELECT * FROM containers WHERE 1=1"
            params = {}
            if container_number:
                query += " AND number LIKE :container_number"
                params['container_number'] = f"{container_number}%"
            if booking_number:
                query += " AND booking = :booking_number"
                params['booking_number'] = booking_number
            if KP_number:
                query += " AND \"KP\" = :KP_number"
                params['KP_number'] = KP_number
            if location:
                query += " AND location LIKE :location"
                params['location'] = f"%{location}%"
            result = db.session.execute(text(query), params)
            containers_raw = result.fetchall()
        else:
            if selected_option == 'option2':
                result = db.session.execute(text("SELECT * FROM containers WHERE number LIKE 'RXTU4%'"))
            elif selected_option == 'option3':
                result = db.session.execute(text("SELECT * FROM containers WHERE number NOT LIKE 'RXTU4%'"))
            else:
                result = db.session.execute(text("SELECT * FROM containers"))
            containers_raw = result.fetchall()

        def clean_value(value):
            return '' if value is None else value

        containers = [
            {
                'number': clean_value(row.number),
                'KP': clean_value(row.KP),
                'booking': clean_value(row.booking),
                'status': clean_value(row.status),
                'location': clean_value(row.location),
                'delivery_date': clean_value(row.delivery_date),
                'pickup_date': clean_value(row.pickup_date),
                'notes': clean_value(row.notes)
            } for row in containers_raw
        ]

        container_count = len(containers)
        return render_template('container.html', 
                             containers=containers, 
                             container_count=container_count,
                             container_number=container_number,
                             booking_number=booking_number,
                             KP_number=KP_number,
                             location=location,
                             selected_value=selected_value)
    except Exception as e:
        return f"Произошла ошибка: {e}"

@app.route('/buking', methods=['GET', 'POST'])
def buking():
    try:
        internal_number_filter = ''
        
        if request.method == 'POST':
            internal_number_filter = request.form.get('internal_number_filter', '')
            
            # Запрос внутренних номеров с фильтрацией
            if internal_number_filter:
                # Используем прямой запрос к модели InternalNumber
                result = db.session.query(InternalNumber)\
                    .filter(InternalNumber.internal_number.ilike(f'%{internal_number_filter}%'))\
                    .order_by(InternalNumber.internal_number)
            else:
                # Запрос всех внутренних номеров из модели InternalNumber
                result = db.session.query(InternalNumber)\
                    .order_by(InternalNumber.internal_number)
        else:
            # Запрос всех внутренних номеров из модели InternalNumber
            result = db.session.query(InternalNumber)\
                .order_by(InternalNumber.internal_number)

        def clean_value(value):
            return '' if value is None else value

        # Для каждого внутреннего номера получаем количество связанных букингов
        internal_numbers = []
        for row in result.all():
            # Получаем количество букингов для текущего внутреннего номера
            booking_count = db.session.query(Booking)\
                .filter(Booking.internal_number == row.internal_number)\
                .count()

            internal_numbers.append({
                'internal_number': clean_value(row.internal_number),
                'pod_direction': clean_value(row.pod_direction),
                'quantity': row.quantity,
                'type_size': clean_value(row.type_size),
                'cargo': clean_value(row.cargo),
                'booking_count': booking_count
            })
        
        internal_numbers_count = len(internal_numbers)

        return render_template('buking.html', 
                              internal_numbers=internal_numbers, 
                              internal_numbers_count=internal_numbers_count,
                              internal_number_filter=internal_number_filter)
    except Exception as e:
        return f"Произошла ошибка: {e}"

@app.route('/add_buking', methods=['POST'])
def add_buking():
    try:
        # Получаем данные из формы
        booking_numbers = request.form.get('booking_numbers', '')
        internal_number = request.form.get('internal_number', '')
        line = request.form.get('line', '')
        quantity = request.form.get('quantity', '')
        vessel = request.form.get('vessel', '')
        
        # Проверяем обязательные поля
        if not booking_numbers or not internal_number:
            return jsonify({
                'success': 0,
                'failed': 1,
                'errors': ['Необходимо указать номера букингов и внутренний номер'],
                'status': 'error'
            })
        
        # Разбиваем список букингов на отдельные номера
        booking_list = [num.strip() for num in booking_numbers.replace(',', '\n').split('\n') if num.strip()]
        
        if not booking_list:
            return jsonify({
                'success': 0,
                'failed': 1,
                'errors': ['Список номеров букингов пуст'],
                'status': 'error'
            })
        
        added_count = 0
        failed_count = 0
        errors = []
        
        # Добавляем каждый букинг в базу с указанным внутренним номером
        for booking_number in booking_list:
            try:
                result = db.session.execute(text("""
                    INSERT INTO bookings (booking, internal_number, line, quantity, vessel)
                    VALUES (:booking, :internal_number, :line, :quantity, :vessel)
                    ON CONFLICT (booking) DO UPDATE SET 
                        internal_number = :internal_number,
                        line = :line,
                        quantity = :quantity,
                        vessel = :vessel
                """), {
                    'booking': booking_number,
                    'internal_number': internal_number,
                    'line': line,
                    'quantity': int(quantity) if quantity else 0,
                    'vessel': vessel
                })
                added_count += 1
            except SQLAlchemyError as e:
                failed_count += 1
                errors.append(f"Ошибка при добавлении букинга {booking_number}: {str(e)}")
    
        db.session.commit()
        
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': 1,
            'errors': [f'Ошибка базы данных: {str(e)}'],
            'status': 'error'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': 1,
            'errors': [f'Непредвиденная ошибка: {str(e)}'],
            'status': 'error'
        })

@app.route('/kp', methods=['GET', 'POST'])
def kp():
    try:
        kp_number = ''
        container_number = ''
        location = ''
        params = {}
        if request.method == 'POST':
            container_number = request.form.get('container_number', '')
            kp_number = request.form.get('kp_number', '')
            location = request.form.get('location', '')
            query = "SELECT \"KPs\".number, \"KPs\".location, \"KPs\".notes FROM \"KPs\""
            if container_number:
                query += " INNER JOIN containers ON containers.\"KP\" = \"KPs\".number WHERE containers.number = :container_number"
                params['container_number'] = container_number
                if kp_number:
                    query += " AND \"KPs\".number = :KP_number"
                    params['KP_number'] = kp_number
                if location:
                    query += " AND \"KPs\".location LIKE :location"
                    params['location'] = f"%{location}%"
            elif location:
                query = "SELECT number, location, notes FROM \"KPs\" WHERE location LIKE :location"
                params['location'] = f"%{location}%"
                if kp_number:
                    query += " AND number LIKE :KP_number"
                    params['KP_number'] = f"%{kp_number}%"
            elif kp_number:
                query = "SELECT number, location, notes FROM \"KPs\" WHERE number LIKE :KP_number"
                params['KP_number'] = f"%{kp_number}%"
            result = db.session.execute(text(query), params)
            kps_raw = result.fetchall()
        else:
            result = db.session.execute(text("SELECT * FROM \"KPs\""))
            kps_raw = result.fetchall()

        def clean_value(value):
            return '' if value is None else value

        kps = [
            {
                'number': clean_value(row.number),
                'location': clean_value(row.location),
                'notes': clean_value(row.notes)
            } for row in kps_raw
        ]
        kps_count = len(kps)

        return render_template('kp.html', 
                              kps=kps, 
                              kps_count=kps_count,
                              container_number=container_number,
                              kp_number=kp_number,
                              location=location)
    except Exception as e:
        return f"Произошла ошибка: {e}"

@app.route('/add_kp', methods=['POST'])
def add_kp():
    try:
        kp_numbers = request.form.get('kp_numbers', request.form.get('kp_number', ''))
        kp_list = [num.strip() for num in kp_numbers.replace(',', '\n').split('\n') if num.strip()]
        added_count = 0
        failed_count = 0
        errors = []

        for kp_number in kp_list:
            result = db.session.execute(text("""
            INSERT INTO "KPs" (number)
            VALUES (:number)
            ON CONFLICT (number) DO NOTHING
            """), {'number': kp_number})
            if result.rowcount > 0:
                added_count += 1
            else:
                failed_count += 1
                errors.append(f"КП {kp_number}: уже существует")

        db.session.commit()
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(kp_list) if 'kp_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/container_details', methods=['GET', 'POST'])
def container_details():
    try:
        result = db.session.execute(text("SELECT * FROM containers"))
        containers = result.fetchall()
        return render_template('container_details.html', containers=containers)
    except Exception as e:
        return f"Произошла ошибка: {e}"

@app.route('/add_container', methods=['POST'])
def add_container():
    try:
        container_numbers = request.form.get('container_numbers', request.form.get('container_number', ''))
        container_list = [num.strip() for num in container_numbers.replace(',', '\n').split('\n') if num.strip()]
        added_count = 0
        failed_count = 0
        errors = []

        pattern = r'^[A-Za-z]{4}\d{7}$'
        for container_number in container_list:
            if len(container_number) > 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком длинный (макс. 11 символов)")
            elif len(container_number) < 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком короткий (мин. 11 символов)")
            else:
                if not re.match(pattern, container_number):
                    failed_count += 1
                    errors.append(f"Контейнер {container_number}: неверный формат (должно быть 4 буквы + 7 цифр)")
                else:
                    formatted_number = container_number[:4].upper() + container_number[4:11].lower()
                    result = db.session.execute(text("""
                        INSERT INTO containers (number, status)
                        VALUES (:number, 'В Китае')
                        ON CONFLICT (number) DO NOTHING
                    """), {'number': formatted_number})
                    if result.rowcount > 0:
                        added_count += 1
                    else:
                        failed_count += 1
                        errors.append(f"Контейнер {formatted_number}: уже существует")

        db.session.commit()
        # Отправляем событие всем клиентам о том, что контейнеры изменились
        if added_count > 0:
            socketio.emit('containers_updated', {'action': 'add'})
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(container_list),
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/suggestion', methods=['POST'])
def search_numbers():
    data = request.get_json()
    query = data.get('query', '')
    search_type = data.get('type', '')

    if not query or not search_type:
        return jsonify([])

    if search_type == 'container':
        results = Container.query.filter(Container.number.ilike(f'%{query}%')).all()
    elif search_type == 'booking':
        results = Booking.query.filter(Booking.booking.ilike(f'%{query}%')).all()
    elif search_type == 'KP':
        results = KP.query.filter(KP.number.ilike(f'%{query}%')).all()
    elif search_type == 'location':
        results = Container.query.filter(Container.location.ilike(f'%{query}%')).all()
        return jsonify([result.location for result in results])
    else:
        return jsonify([])

    return jsonify([result.booking for result in results])

@app.route('/add_container_sheet', methods=['POST'])
def add_container_sheet():
    file = request.files.get('fileInput')
    container_numbers_text = request.form.get('containerNumbers')
    KP_number_text = request.form.get('KP_number')
    added_count = 0
    if file:
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.filename.endswith('.xlsx'):
                df = pd.read_excel(file)
            else:
                flash("Неверный формат файла (.csv или .xlsx)")
                return redirect(url_for('container'))

            container_numbers = df.iloc[0:, 0].tolist()
            if container_numbers_text:
                container_numbers.extend(container_numbers_text.split('\n'))

            for number in container_numbers:
                number = str(number).strip()
                if number:
                    existing_container = db.session.query(Container).filter_by(number=number).first()
                    added_count += 1
                    if db.session.query(KP).filter_by(number=KP_number_text).first() is None and KP_number_text:
                        kp_entry = KP(number=KP_number_text)
                        db.session.add(kp_entry)
                        db.session.commit()
                    container = db.session.query(Container).filter_by(number=number).first()
                    if container and KP_number_text:
                        container.KP = KP_number_text
                    if existing_container is None:
                        container = Container(number=number, status='В Китае')
                        db.session.add(container)
            db.session.commit()
            flash(f"Успешно! Было вставлено и обновлено {added_count} контейнеров!")
        except Exception as e:
            db.session.rollback()
            flash("Что-то пошло не так. Убедитесь, что в вашей таблице номера находятся на первой странице в 1 столбце")
        return redirect(url_for('container'))
    else:
        flash("Ошибка: файл не был добавлен")
        return redirect(url_for('container'))

@app.route('/delete_containers', methods=['POST'])
def delete_containers():
    try:
        container_numbers = request.form.get('container_numbers', '')
        container_list = [num.strip() for num in container_numbers.replace(',', '\n').split('\n') if num.strip()]
        deleted_count = 0
        failed_count = 0
        errors = []

        pattern = r'^[A-Za-z]{4}\d{7}$'
        for container_number in container_list:
            if len(container_number) > 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком длинный (макс. 11 символов)")
            elif len(container_number) < 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком короткий (мин. 11 символов)")
            else:
                if not re.match(pattern, container_number):
                    failed_count += 1
                    errors.append(f"Контейнер {container_number}: неверный формат (должно быть 4 буквы + 7 цифр)")
                else:
                    formatted_number = container_number[:4].upper() + container_number[4:11].lower()
                    result = db.session.execute(text("""
                        DELETE FROM containers WHERE number = :number
                    """), {'number': formatted_number})
                    if result.rowcount > 0:
                        deleted_count += 1
                    else:
                        failed_count += 1
                        errors.append(f"Контейнер {formatted_number}: не найден в базе")

        db.session.commit()
        # Отправляем событие всем клиентам о том, что контейнеры изменились
        if deleted_count > 0:
            socketio.emit('containers_updated', {'action': 'delete'})
        return jsonify({
            'success': deleted_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if deleted_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(container_list),
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/delete_buking', methods=['POST'])
def delete_buking():
    try:
        button_number = request.form.get('hidden_input')
        buking = db.session.query(Booking).filter_by(booking=button_number).first()
        if buking:
            db.session.delete(buking)
            db.session.commit()
            flash(f"Букинг {button_number} успешно удален.")
        else:
            flash(f"Букинг {button_number} не найден.")
    except Exception as e:
        db.session.rollback()
        flash(f"Ошибка при удалении букинга: {str(e)}")
    return redirect(url_for('buking'))

@app.route('/delete_kp', methods=['POST'])
def delete_kp():
    try:
        button_number = request.form.get('hidden_input')
        kp = db.session.query(KP).filter_by(number=button_number).first()
        if kp:
            db.session.delete(kp)
            db.session.commit()
            flash(f"КП {button_number} успешно удален.")
        else:
            flash(f"КП {button_number} не найден.")
    except Exception as e:
        db.session.rollback()
        flash(f"Ошибка при удалении КП: {str(e)}")
    return redirect(url_for('kp'))

@app.route('/get_container_data', methods=['POST'])
def get_container_data():
    try:
        container_numbers = request.form.get('container_numbers', '')
        container_list = [num.strip() for num in container_numbers.replace(',', '\n').split('\n') if num.strip()]
        containers = []
        
        for number in container_list:
            result = db.session.execute(
                text("SELECT * FROM containers WHERE number = :number"),
                {'number': number}
            ).fetchone()
            if result:
                containers.append({
                    'number': result.number,
                    'KP': result.KP or '',
                    'booking': result.booking or '',
                    'status': result.status or '',
                    'location': result.location or '',
                    'delivery_date': result.delivery_date or '',
                    'pickup_date': result.pickup_date or '',
                    'notes': result.notes or ''
                })
                
        return jsonify({'containers': containers})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/update_container', methods=['POST'])
def update_container():
    try:
        number = request.form.get('number')
        kp = request.form.get('kp') or None
        booking = request.form.get('booking') or None
        status = request.form.get('status')
        raw_loc = request.form.get('location')
        location = raw_loc.strip() if raw_loc and raw_loc.strip() else None
        raw_del = request.form.get('delivery_date')
        delivery_date = raw_del.strip() if raw_del and raw_del.strip() else None
        raw_pick = request.form.get('pickup_date')
        pickup_date = raw_pick.strip() if raw_pick and raw_pick.strip() else None
        raw_notes = request.form.get('notes')
        notes = raw_notes.strip() if raw_notes and raw_notes.strip() else None

        result = db.session.execute(
            text("""
                UPDATE containers 
                SET "KP" = :kp, booking = :booking, status = :status, 
                    location = :location, delivery_date = :delivery_date, 
                    pickup_date = :pickup_date, notes = :notes
                WHERE number = :number
            """),
            {
                'number': number, 'kp': kp, 'booking': booking, 
                'status': status, 'location': location, 
                'delivery_date': delivery_date, 'pickup_date': pickup_date, 
                'notes': notes
            }
        )
        
        db.session.commit()
        # Отправляем событие всем клиентам о том, что контейнеры изменились
        if result.rowcount > 0:
            socketio.emit('containers_updated', {'action': 'edit'})
        # Формируем статус с флагами для ответа
        def status_with_flags(status):
            if status == 'Направлен в Китай':
                return f"{status} 🇷🇺➡️🇨🇳"
            elif status == 'В Китае':
                return f"{status} 🇨🇳"
            elif status == 'Направлен в Россию':
                return f"{status} 🇨🇳➡️🇷🇺"
            elif status == 'В России':
                return f"{status} 🇷🇺"
            else:
                return status

        return jsonify({
            'success': result.rowcount,
            'failed': 0,
            'errors': None,
            'status_with_flags': status_with_flags(status)
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        error_msg = str(e)
        user_friendly_error = str(e)
        
        # Улучшенная обработка ошибок с внешним ключом
        if "ForeignKeyViolation" in error_msg:
            # Ошибка связи с букингом
            if "containers_booking_fkey" in error_msg:
                booking_value = booking or "не указан"
                user_friendly_error = f"Букинг '{booking_value}' не существует в системе. Вы должны сначала создать букинг с этим номером."
            
            # Ошибка связи с КП
            elif "containers_kp_fkey" in error_msg:
                kp_value = kp or "не указан"
                user_friendly_error = f"КП '{kp_value}' не существует в системе. Вы должны сначала создать КП с этим номером."
            
            # Другие ошибки внешнего ключа
            else:
                user_friendly_error = "Ошибка связи с внешней таблицей. Один из указанных идентификаторов отсутствует в системе."
        
        return jsonify({
            'success': 0,
            'failed': 1,
            'errors': [user_friendly_error],
            'status': 'error'
        })

@app.route('/get_kp_numbers', methods=['GET'])
def get_kp_numbers():
    try:
        result = db.session.execute(text("SELECT number FROM \"KPs\""))
        kp_numbers = [row.number for row in result.fetchall()]
        return jsonify(kp_numbers)
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_booking_numbers', methods=['GET'])
def get_booking_numbers():
    try:
        result = db.session.execute(text("SELECT booking FROM bookings"))
        booking_numbers = [row.booking for row in result.fetchall()]
        return jsonify(booking_numbers)
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_containers', methods=['GET'])
def get_containers():
    try:
        option = request.args.get('option', 'option1')
        if option == 'option2':
            result = db.session.execute(text("SELECT * FROM containers WHERE number LIKE 'RXTU4%'"))
        elif option == 'option3':
            result = db.session.execute(text("SELECT * FROM containers WHERE number NOT LIKE 'RXTU4%'"))
        else:
            result = db.session.execute(text("SELECT * FROM containers"))
        
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value

        containers = [
            {
                'number': clean_value(row.number),
                'KP': clean_value(row.KP),
                'booking': clean_value(row.booking),
                'status': clean_value(row.status),
                'location': clean_value(row.location),
                'delivery_date': clean_value(row.delivery_date),
                'pickup_date': clean_value(row.pickup_date),
                'notes': clean_value(row.notes)
            } for row in result.fetchall()
        ]
        return jsonify({'containers': containers, 'container_count': len(containers)})
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_from_inventory', methods=['POST'])
def add_from_inventory():
    try:
        container_numbers = request.form.get('container_numbers', '').strip()
        kp_number = request.form.get('kp_number', '').strip()

        if not container_numbers:
            return jsonify({
                'success': 0,
                'failed': 0,
                'errors': ['Нет данных для добавления'],
                'status': 'error'
            })

        container_list = [num.strip() for num in container_numbers.split('\n') if num.strip()]
        added_count = 0
        failed_count = 0
        errors = []

        pattern = r'^[A-Za-z]{4}\d{7}$'

        # Если указан номер КП, добавляем его в таблицу KPs
        if kp_number and not db.session.query(KP).filter_by(number=kp_number).first():
            kp_entry = KP(number=kp_number)
            db.session.add(kp_entry)
            db.session.commit()

        # Добавляем каждый контейнер со статусом "В Китае"
        for container_number in container_list:
            if len(container_number) > 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком длинный (макс. 11 символов)")
            elif len(container_number) < 11:
                failed_count += 1
                errors.append(f"Контейнер {container_number}: слишком короткий (мин. 11 символов)")
            else:
                if not re.match(pattern, container_number):
                    failed_count += 1
                    errors.append(f"Контейнер {container_number}: неверный формат (должно быть 4 буквы + 7 цифр)")
                else:
                    formatted_number = container_number[:4].upper() + container_number[4:11].lower()
                    existing_container = db.session.query(Container).filter_by(number=formatted_number).first()
                    if existing_container:
                        # Если контейнер существует, обновляем KP, но не меняем статус
                        if kp_number:
                            existing_container.KP = kp_number
                        failed_count += 1
                        errors.append(f"Контейнер {formatted_number}: уже существует")
                    else:
                        # Добавляем новый контейнер со статусом "В Китае"
                        new_container = Container(
                            number=formatted_number, 
                            KP=kp_number if kp_number else None,
                            status='В Китае'
                        )
                        db.session.add(new_container)
                        added_count += 1

        db.session.commit()
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(container_list) if 'container_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

# Новые маршруты для КП и Букингов

@app.route('/get_kps', methods=['GET'])
def get_kps():
    try:
        result = db.session.execute(text("SELECT * FROM \"KPs\""))
        
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value

        kps = [
            {
                'number': clean_value(row.number),
                'location': clean_value(row.location),
                'notes': clean_value(row.notes)
            } for row in result.fetchall()
        ]
        return jsonify({'kps': kps, 'kps_count': len(kps)})
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_bookings', methods=['GET'])
def get_bookings():
    try:
        result = db.session.execute(text("SELECT booking, internal_number, line, quantity, vessel FROM bookings"))
        
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value

        bookings = [
            {
                'booking': clean_value(row.booking),
                'internal_number': clean_value(row.internal_number),
                'line': clean_value(row.line),
                'quantity': clean_value(row.quantity),
                'vessel': clean_value(row.vessel)
            } for row in result.fetchall()
        ]
        return jsonify({'bookings': bookings, 'bookings_count': len(bookings)})
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_kps', methods=['POST'])
def delete_kps():
    try:
        kp_numbers = request.form.get('kp_numbers', '')
        kp_list = [num.strip() for num in kp_numbers.replace(',', '\n').split('\n') if num.strip()]
        deleted_count = 0
        failed_count = 0
        errors = []

        for kp_number in kp_list:
            result = db.session.execute(text("""
                DELETE FROM "KPs" WHERE number = :number
            """), {'number': kp_number})
            if result.rowcount > 0:
                deleted_count += 1
            else:
                failed_count += 1
                errors.append(f"КП {kp_number}: не найден в базе")

        db.session.commit()
        return jsonify({
            'success': deleted_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if deleted_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(kp_list) if 'kp_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/delete_bookings', methods=['POST'])
def delete_bookings():
    try:
        booking_numbers = request.form.get('booking_numbers', '')
        booking_list = [num.strip() for num in booking_numbers.replace(',', '\n').split('\n') if num.strip()]
        deleted_count = 0
        failed_count = 0
        errors = []

        for booking_number in booking_list:
            result = db.session.execute(text("""
                DELETE FROM bookings WHERE booking = :booking
            """), {'booking': booking_number})
            if result.rowcount > 0:
                deleted_count += 1
            else:
                failed_count += 1
                errors.append(f"Букинг {booking_number}: не найден в базе")

        db.session.commit()
        return jsonify({
            'success': deleted_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if deleted_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(booking_list) if 'booking_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/get_kp_data', methods=['POST'])
def get_kp_data():
    try:
        kp_numbers = request.form.get('kp_numbers', '')
        kp_list = [num.strip() for num in kp_numbers.replace(',', '\n').split('\n') if num.strip()]
        kps = []
        
        for number in kp_list:
            result = db.session.execute(
                text("SELECT * FROM \"KPs\" WHERE number = :number"),
                {'number': number}
            ).fetchone()
            if result:
                kps.append({
                    'number': result.number,
                    'location': result.location or '',
                    'notes': result.notes or ''
                })
                
        return jsonify({'kps': kps})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/get_booking_data', methods=['POST'])
def get_booking_data():
    try:
        booking_numbers = request.form.get('booking_numbers', '')
        booking_list = [num.strip() for num in booking_numbers.replace(',', '\n').split('\n') if num.strip()]
        bookings = []
        
        for number in booking_list:
            result = db.session.execute(
                text("SELECT booking, internal_number, line, quantity, vessel FROM bookings WHERE booking = :booking"),
                {'booking': number}
            ).fetchone()
            if result:
                bookings.append({
                    'booking': result.booking,
                    'internal_number': result.internal_number or '',
                    'line': result.line or '',
                    'quantity': result.quantity or '',
                    'vessel': result.vessel or ''
                })
                
        return jsonify({'bookings': bookings})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/update_kp', methods=['POST'])
def update_kp():
    try:
        number = request.form.get('number')
        location = request.form.get('location') or None
        notes = request.form.get('notes') or None

        result = db.session.execute(
            text("""
                UPDATE "KPs" 
                SET location = :location, notes = :notes
                WHERE number = :number
            """),
            {
                'number': number,
                'location': location,
                'notes': notes
            }
        )
        
        db.session.commit()
        return jsonify({'success': result.rowcount, 'failed': 0, 'errors': None})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'success': 0, 'failed': 1, 'errors': [str(e)]})

@app.route('/update_booking', methods=['POST'])
def update_booking():
    try:
        booking = request.form.get('booking')
        internal_number = request.form.get('internal_number') or None
        line = request.form.get('line') or None
        quantity = request.form.get('quantity') or None
        vessel = request.form.get('vessel') or None

        result = db.session.execute(
            text("""
                UPDATE bookings 
                SET internal_number = :internal_number, line = :line, quantity = :quantity, vessel = :vessel
                WHERE booking = :booking
            """),
            {
                'booking': booking,
                'internal_number': internal_number,
                'line': line,
                'quantity': quantity,
                'vessel': vessel
            }
        )
        
        db.session.commit()
        return jsonify({'success': result.rowcount, 'failed': 0, 'errors': None})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'success': 0, 'failed': 1, 'errors': [str(e)]})

@app.route('/add_kp_from_inventory', methods=['POST'])
def add_kp_from_inventory():
    try:
        kp_numbers = request.form.get('kp_numbers', '').strip()

        if not kp_numbers:
            return jsonify({
                'success': 0,
                'failed': 0,
                'errors': ['Нет данных для добавления'],
                'status': 'error'
            })

        kp_list = [num.strip() for num in kp_numbers.split('\n') if num.strip()]
        added_count = 0
        failed_count = 0
        errors = []

        for kp_number in kp_list:
            result = db.session.execute(text("""
                INSERT INTO "KPs" (number)
                VALUES (:number)
                ON CONFLICT (number) DO NOTHING
            """), {'number': kp_number})
            if result.rowcount > 0:
                added_count += 1
            else:
                failed_count += 1
                errors.append(f"КП {kp_number}: уже существует")

        db.session.commit()
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(kp_list) if 'kp_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/add_booking_from_inventory', methods=['POST'])
def add_booking_from_inventory():
    try:
        booking_numbers = request.form.get('booking_numbers', '').strip()
        internal_number = request.form.get('internal_number', '').strip()
        line = request.form.get('line', '').strip()
        quantity = request.form.get('quantity', '').strip()
        vessel = request.form.get('vessel', '').strip()

        if not booking_numbers:
            return jsonify({
                'success': 0,
                'failed': 0,
                'errors': ['Нет данных для добавления'],
                'status': 'error'
            })

        booking_list = [num.strip() for num in booking_numbers.split('\n') if num.strip()]
        added_count = 0
        failed_count = 0
        errors = []

        for booking_number in booking_list:
            result = db.session.execute(text("""
                INSERT INTO bookings (booking, internal_number, line, quantity, vessel)
                VALUES (:booking, :internal_number, :line, :quantity, :vessel)
                ON CONFLICT (booking) DO NOTHING
            """), {
                'booking': booking_number,
                'internal_number': internal_number,
                'line': line,
                'quantity': quantity,
                'vessel': vessel
            })
            if result.rowcount > 0:
                added_count += 1
            else:
                failed_count += 1
                errors.append(f"Букинг {booking_number}: уже существует")

        db.session.commit()
        return jsonify({
            'success': added_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if added_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(booking_list) if 'booking_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/add_containers_from_inventory', methods=['POST'])
def add_containers_from_inventory():
    """
    Принимает POST с полями:
      - tsv_data: строки вида <number>\t<KP>\t<booking>\t<status>\t<location>\t<delivery_date>\t<pickup_date>\t<notes>\n...
      - columns: список имён полей (в нужном порядке, через запятую)
    Добавляет или обновляет контейнеры в базе.
    """
    try:
        tsv_data = request.form.get('tsv_data', '').strip()
        columns = request.form.get('columns', '').strip().split(',')
        if not tsv_data or not columns or 'number' not in columns:
            return jsonify({'success': 0, 'failed': 0, 'errors': ['Данные или столбцы не переданы, либо не выбран номер контейнера'], 'status': 'error'})
        rows = [r for r in tsv_data.split('\n') if r.strip()]
        added_count = 0
        updated_count = 0
        failed_count = 0
        errors = []
        pattern = r'^[A-Za-z]{4}\d{7}$'
        for row in rows:
            values = row.split('\t')
            data = dict(zip(columns, values))
            # Убираем лишние пробелы и символы переноса строк в значениях
            for key, val in data.items():
                if isinstance(val, str):
                    data[key] = val.strip()
            number = data.get('number', '').strip()
            if len(number) > 11:
                failed_count += 1
                errors.append(f"Контейнер {number}: слишком длинный (макс. 11 символов)")
                continue
            elif len(number) < 11:
                failed_count += 1
                errors.append(f"Контейнер {number}: слишком короткий (мин. 11 символов)")
                continue
            if not re.match(pattern, number):
                failed_count += 1
                errors.append(f"Контейнер {number}: неверный формат (должно быть 4 буквы + 7 цифр)")
                continue
            formatted_number = number[:4].upper() + number[4:11].lower()
            
            # Подготовка полей
            fields = {
                'number': formatted_number,
                'KP': data.get('kp') or None,
                'booking': data.get('booking') or None,
                'status': data.get('status') or 'В Китае',
                'location': data.get('location') or None,
                'delivery_date': data.get('delivery_date') or None,
                'pickup_date': data.get('pickup_date') or None,
                'notes': data.get('notes') or None
            }
            
            # Проверка и преобразование дат
            date_errors = []
            for date_field in ['delivery_date', 'pickup_date']:
                val = fields[date_field]
                if not val:
                    fields[date_field] = None
                    continue
                    
                # Проверка коротких значений (только цифры)
                if re.match(r'^\d{1,2}$', val):
                    date_errors.append(f"Контейнер {formatted_number}: неверный формат даты '{date_field}': '{val}' (должно быть ДД.ММ.ГГГГ)")
                    fields[date_field] = None
                    continue
                
                # Преобразование стандартных форматов
                if re.match(r'\d{2}\.\d{2}\.\d{4}', val):
                    try:
                        d, m, y = val.split('.')
                        day = int(d)
                        month = int(m)
                        year = int(y)
                        
                        # Проверка валидности даты
                        if day < 1 or day > 31 or month < 1 or month > 12:
                            date_errors.append(f"Контейнер {formatted_number}: недействительная дата '{val}' для поля '{date_field}'")
                            fields[date_field] = None
                            continue
                            
                        fields[date_field] = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
                    except ValueError:
                        date_errors.append(f"Контейнер {formatted_number}: неверный формат даты '{val}' для поля '{date_field}'")
                        fields[date_field] = None
                elif re.match(r'\d{4}-\d{2}-\d{2}', val):
                    fields[date_field] = val
                else:
                    date_errors.append(f"Контейнер {formatted_number}: неверный формат даты '{val}' для поля '{date_field}' (должно быть ДД.ММ.ГГГГ или ГГГГ-ММ-ДД)")
                    fields[date_field] = None
            
            if date_errors:
                failed_count += 1
                errors.extend(date_errors)
                continue
                
            # Проверяем существование
            existing = db.session.query(Container).filter_by(number=formatted_number).first()
            if existing:
                # Обновляем все выбранные поля
                for k, v in fields.items():
                    if k != 'number' and v is not None:
                        setattr(existing, k, v)
                updated_count += 1
            else:
                db.session.add(Container(**fields))
                added_count += 1
        
        db.session.commit()
        if added_count + updated_count > 0:
            socketio.emit('containers_updated', {'action': 'add'})
        return jsonify({'success': added_count, 'updated': updated_count, 'failed': failed_count, 'errors': errors if errors else None, 'status': 'success' if added_count + updated_count > 0 else 'error'})
    except SQLAlchemyError as e:
        db.session.rollback()
        error_msg = str(e)
        user_friendly_error = "Ошибка базы данных"
        
        # Разбор ошибок формата даты
        if "InvalidDatetimeFormat" in error_msg:
            # Извлекаем значение, вызвавшее ошибку
            match = re.search(r"date: \"(.+?)\"", error_msg)
            invalid_date = match.group(1) if match else "неизвестное значение"
            
            user_friendly_error = f"Ошибка формата даты: '{invalid_date}' не является корректной датой. Используйте формат ДД.ММ.ГГГГ"
        else:
            user_friendly_error = f"Ошибка базы данных: {error_msg}"
            
        return jsonify({'success': 0, 'failed': len(rows) if 'rows' in locals() else 0, 'errors': [user_friendly_error], 'status': 'error'})

@app.route('/get_bookings_by_internal_number', methods=['POST'])
def get_bookings_by_internal_number():
    try:
        internal_number = request.form.get('internal_number', '')
        if not internal_number:
            return jsonify({
                'success': 0,
                'bookings': [],
                'error': 'Внутренний номер не указан'
            })
            
        # Запрос всех букингов с данным внутренним номером
        result = db.session.execute(
            text("SELECT booking, internal_number, line, quantity, vessel FROM bookings WHERE internal_number = :internal_number"),
            {'internal_number': internal_number}
        )
        
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value

        bookings = [
            {
                'booking': clean_value(row.booking),
                'internal_number': clean_value(row.internal_number),
                'line': clean_value(row.line),
                'quantity': clean_value(row.quantity),
                'vessel': clean_value(row.vessel)
            } for row in result.fetchall()
        ]
        
        return jsonify({
            'success': 1,
            'bookings': bookings,
            'count': len(bookings)
        })
    except SQLAlchemyError as e:
        return jsonify({
            'success': 0,
            'bookings': [],
            'error': str(e)
        }), 500

@app.route('/get_bookings_by_internal/<internal_number>', methods=['GET'])
def get_bookings_by_internal(internal_number):
    try:
        if not internal_number:
            return jsonify({
                'success': False,
                'bookings': [],
                'error': 'Внутренний номер не указан'
            })
            
        # Запрос всех букингов с данным внутренним номером
        bookings_query = db.session.query(Booking).filter(Booking.internal_number == internal_number).all()
        
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value

        bookings = []
        for booking in bookings_query:
            bookings.append({
                'id': booking.id,
                'booking_number': clean_value(booking.booking),
                'internal_number': clean_value(booking.internal_number),
                'direction': clean_value(booking.line),
                'pol': '',  # Эти поля будут добавлены в будущем
                'pod': '',  # Эти поля будут добавлены в будущем
                'booking_date': clean_value(booking.booking_date),
                'quantity': clean_value(booking.quantity),
                'vessel': clean_value(booking.vessel)
            })
        
        return jsonify({
            'success': True,
            'bookings': bookings
        })
    except SQLAlchemyError as e:
        return jsonify({
            'success': False,
            'bookings': [],
            'error': str(e)
        }), 500

@app.route('/add_internal_number', methods=['POST'])
def add_internal_number():
    try:
        # Получаем данные из формы
        internal_number = request.form.get('internal_number', '').strip()
        pod_direction = request.form.get('pod_direction', '').strip()
        quantity = request.form.get('quantity', '').strip()
        type_size = request.form.get('type_size', '').strip()
        cargo = request.form.get('cargo', '').strip()
        
        # Проверяем обязательные поля
        if not internal_number or not pod_direction:
            return jsonify({
                'success': 0,
                'failed': 1,
                'errors': ['Необходимо указать внутренний номер и POD/направление'],
                'status': 'error'
            })
        
        # Проверяем формат внутреннего номера (согласно ограничению в БД)
        if not re.match(r'^[A-Z0-9]+-[0-3][0-9][0-1][0-9][0-9]{4}$', internal_number):
            return jsonify({
                'success': 0,
                'failed': 1,
                'errors': ['Внутренний номер должен соответствовать формату XXXXX-DDMMYYYY'],
                'status': 'error'
            })
        
        # Проверяем, существует ли уже такой внутренний номер
        existing_internal = db.session.query(InternalNumber).filter_by(internal_number=internal_number).first()
        
        if existing_internal:
            # Внутренний номер уже существует, обновляем его
            existing_internal.pod_direction = pod_direction
            existing_internal.quantity = int(quantity) if quantity else 0
            existing_internal.type_size = type_size
            existing_internal.cargo = cargo
            db.session.commit()
            
            return jsonify({
                'success': 1,
                'failed': 0,
                'errors': None,
                'status': 'success',
                'message': f'Внутренний номер {internal_number} успешно обновлен'
            })
        else:
            # Создаем новый внутренний номер
            new_internal = InternalNumber(
                internal_number=internal_number,
                pod_direction=pod_direction,
                quantity=int(quantity) if quantity else 0,
                type_size=type_size,
                cargo=cargo
            )
            db.session.add(new_internal)
            db.session.commit()
            
            return jsonify({
                'success': 1,
                'failed': 0,
                'errors': None,
                'status': 'success',
                'message': f'Внутренний номер {internal_number} успешно создан'
            })
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': 1,
            'errors': [f'Ошибка базы данных: {str(e)}'],
            'status': 'error'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': 1,
            'errors': [f'Непредвиденная ошибка: {str(e)}'],
            'status': 'error'
        })

@app.route('/delete_internal_number', methods=['POST'])
def delete_internal_number():
    try:
        internal_numbers = request.form.get('internal_numbers', '')
        internal_list = [num.strip() for num in internal_numbers.replace(',', '\n').split('\n') if num.strip()]
        deleted_count = 0
        failed_count = 0
        errors = []

        for internal_number in internal_list:
            # Находим внутренний номер в базе данных
            internal_to_delete = db.session.query(InternalNumber).filter_by(internal_number=internal_number).first()
            if internal_to_delete:
                # Если найден, удаляем его
                db.session.delete(internal_to_delete)
                deleted_count += 1
            else:
                failed_count += 1
                errors.append(f"Внутренний номер {internal_number}: не найден в базе")

        db.session.commit()
        return jsonify({
            'success': deleted_count,
            'failed': failed_count,
            'errors': errors if errors else None,
            'status': 'success' if deleted_count > 0 else 'error'
        })
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            'success': 0,
            'failed': len(internal_list) if 'internal_list' in locals() else 0,
            'errors': [f"Ошибка базы данных: {str(e)}"],
            'status': 'error'
        })

@app.route('/get_internal_numbers', methods=['GET'])
def get_internal_numbers():
    try:
        # Получаем параметры фильтрации
        internal_number_filter = request.args.get('internal_number', '')
        pod_direction_filter = request.args.get('pod_direction', '')
        quantity_filter = request.args.get('quantity', '')
        type_size_filter = request.args.get('type_size', '')
        cargo_filter = request.args.get('cargo', '')
        
        # Базовый запрос
        query = db.session.query(InternalNumber)
        
        # Добавляем фильтры, если они указаны
        if internal_number_filter:
            query = query.filter(InternalNumber.internal_number.ilike(f'%{internal_number_filter}%'))
        if pod_direction_filter:
            query = query.filter(InternalNumber.pod_direction.ilike(f'%{pod_direction_filter}%'))
        if quantity_filter:
            try:
                quantity_int = int(quantity_filter)
                query = query.filter(InternalNumber.quantity == quantity_int)
            except ValueError:
                pass  # Игнорируем фильтр, если значение не число
        if type_size_filter:
            query = query.filter(InternalNumber.type_size.ilike(f'%{type_size_filter}%'))
        if cargo_filter:
            query = query.filter(InternalNumber.cargo.ilike(f'%{cargo_filter}%'))
            
        # Сортировка результатов
        query = query.order_by(InternalNumber.internal_number)
        result = query.all()
        
        # Функция для очистки значений
        def clean_value(value):
            if value is None or value == '' or value == "None":
                return ''
            return value
        
        # Формируем ответ
        internal_numbers = []
        for row in result:
            # Получаем количество букингов для текущего внутреннего номера
            booking_count = db.session.query(Booking)\
                .filter(Booking.internal_number == row.internal_number)\
                .count()

            internal_numbers.append({
                'internal_number': clean_value(row.internal_number),
                'pod_direction': clean_value(row.pod_direction),
                'quantity': row.quantity,
                'type_size': clean_value(row.type_size),
                'cargo': clean_value(row.cargo),
                'booking_count': booking_count
            })
        
        return jsonify({
            'internal_numbers': internal_numbers,
            'internal_numbers_count': len(internal_numbers)
        })
    except Exception as e:
        app.logger.error(f'Ошибка при получении внутренних номеров: {str(e)}')
        return jsonify({
            'error': f'Ошибка при получении данных: {str(e)}'
        }), 500

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)