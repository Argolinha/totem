import io
import os
import tempfile
from pathlib import Path
from unittest.mock import patch

os.environ['DATABASE_URL'] = 'sqlite:///' + str(Path(tempfile.mkdtemp()) / 'test.db')
os.environ['ADMIN_EMAIL'] = 'test@example.com'
os.environ['ADMIN_PASSWORD'] = 'test-password'
os.environ['AUTH_SECRET_KEY'] = 'test-only-signing-key'

from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.database import SessionLocal, Base, engine
from app.models import Session, SessionStatus, Photo, AdminUser
from app.auth import hash_password
import pytest


@pytest.fixture(autouse=True)
def reset_test_database():
    Base.metadata.drop_all(bind=engine)
    yield



def test_admin_flow():
    with TestClient(app) as client:
        assert client.get('/api/admin/clientes').status_code == 401
        assert client.post('/api/admin/auth/login',json={'email':'test@example.com','password':'bad'}).status_code == 401
        login=client.post('/api/admin/auth/login',json={'email':'test@example.com','password':'test-password'})
        assert login.status_code==200, login.text
        client.headers['Authorization']='Bearer '+login.json()['access_token']
        assert client.get('/api/admin/auth/me').json()['email']=='test@example.com'
        customer=client.post('/api/admin/clientes',json={'nome':'Cliente teste','email':'cliente@example.com'})
        assert customer.status_code==201, customer.text
        cid=customer.json()['id']
        assert client.put('/api/admin/clientes/'+cid,json={'telefone':'11999999999'}).status_code==200
        assert client.get('/api/admin/clientes?q=teste').json()[0]['telefone']=='11999999999'
        quote=client.post('/api/admin/orcamentos',json={'cliente_id':cid,'titulo':'Evento teste','data_evento_prevista':'2026-11-01T15:00:00','itens':[{'descricao':'Serviço','quantidade':2,'valor_unitario':19.99}]})
        assert quote.status_code==201,quote.text
        qid=quote.json()['id']; assert quote.json()['valor_total']==39.98
        assert client.post(f'/api/admin/orcamentos/{qid}/converter-em-evento').status_code==409
        assert client.put(f'/api/admin/orcamentos/{qid}',json={'status':'invalido'}).status_code==422
        assert client.put(f'/api/admin/orcamentos/{qid}',json={'status':'aprovado'}).status_code==200
        event=client.post(f'/api/admin/orcamentos/{qid}/converter-em-evento')
        assert event.status_code==201,event.text
        assert client.post(f'/api/admin/orcamentos/{qid}/converter-em-evento').status_code==409
        assert client.delete('/api/admin/clientes/'+cid).status_code==409
        assert client.post('/api/admin/eventos',json={'nome':'Teste','cliente_id':cid,'data_evento':'2026-11-01T15:00:00','status':'invalido'}).status_code==422
        effect=client.post('/api/admin/efeitos',json={'nome':'Efeito real','prompt':'Studio portrait'})
        assert effect.status_code==201,effect.text
        assert any(e['name']=='Efeito real' for e in client.get('/api/efeitos').json())
        png=io.BytesIO();Image.new('RGBA',(4,4)).save(png,format='PNG')
        frame=client.post('/api/admin/molduras',data={'nome':'Moldura teste','padrao':'true'},files={'file':('frame.png',png.getvalue(),'image/png')})
        assert frame.status_code==201,frame.text
        assert client.get(frame.json()['arquivo_path']).status_code==200
        assert client.post('/api/admin/molduras',data={'nome':'Inválida'},files={'file':('frame.png',b'not an image','image/png')}).status_code==422
        assert client.get('/api/admin/sessions?limit=-1').status_code==422
        assert client.get('/api/admin/system').status_code==200
        assert client.get('/api/admin/dashboard/stats').json()['total_clientes']==1
        with SessionLocal() as db:
            session=Session(status=SessionStatus.ERROR);db.add(session);db.flush();db.add(Photo(session_id=session.id,original_path='/static/original/test.jpg'));db.commit();sid=session.id
            db.add(AdminUser(nome='Operador',email='operator@example.com',password_hash=hash_password('operator-pass'),role='operator',ativo=True));db.commit()
        with patch('app.routes.admin.process_photo_task.apply_async',side_effect=ConnectionError('redis unavailable')):
            assert client.post(f'/api/admin/sessions/{sid}/reprocess').status_code==503
        assert client.get('/api/admin/sessions').json()[0]['status']=='error'
        with patch('app.routes.admin.process_photo_task.apply_async') as task:
            assert client.post(f'/api/admin/sessions/{sid}/reprocess').status_code==200
            task.assert_called_once()
        assert client.post(f'/api/admin/sessions/{sid}/reprocess').status_code==409
        operator=client.post('/api/admin/auth/login',json={'email':'operator@example.com','password':'operator-pass'}).json()['access_token']
        assert client.delete('/api/admin/efeitos/'+effect.json()['id'],headers={'Authorization':'Bearer '+operator}).status_code==403
        assert client.delete('/api/admin/efeitos/'+effect.json()['id']).status_code==204
        assert client.get('/api/admin/auth/me',headers={'Authorization':'Bearer invalid'}).status_code==401


def test_original_ui_fields_persist():
    with TestClient(app) as client:
        token = client.post('/api/admin/auth/login', json={'email':'test@example.com','password':'test-password'}).json()['access_token']
        client.headers['Authorization'] = 'Bearer ' + token
        customer = client.post('/api/admin/clientes', json={'nome':'Cliente UI','ui':{'evento':'Casamento','data':'2026-12-01','valor':'1200'}})
        assert customer.status_code == 201, customer.text
        cid = customer.json()['id']
        assert client.get('/api/admin/clientes/'+cid).json()['ui']['evento'] == 'Casamento'
        assert client.put('/api/admin/clientes/'+cid,json={'ui':{'valor':'1500'}}).json()['ui']['evento'] == 'Casamento'
        assert client.get('/api/admin/clientes/'+cid).json()['ui']['valor'] == '1500'
        effect = client.post('/api/admin/efeitos',json={'nome':'Efeito com categoria','prompt':'Portrait','ui':{'categoria':'Avatar'}})
        assert effect.status_code == 201,effect.text
        assert effect.json()['ui']['categoria'] == 'Avatar'
        event = client.post('/api/admin/eventos',json={'cliente_id':cid,'nome':'Evento UI','data_evento':'2026-12-01T12:00:00','ui':{'tipo':'Casamento','convidados':120,'operador':'Operador teste'}})
        assert event.status_code == 201,event.text
        eid=event.json()['id']
        assert client.put('/api/admin/eventos/'+eid,json={'ui':{'status':'Em produção'}}).json()['ui']['convidados'] == 120
        quote=client.post('/api/admin/orcamentos',json={'cliente_id':cid,'titulo':'UI orçamento','ui':{'stage':'novos','convidados':120},'itens':[{'descricao':'Serviço','quantidade':1,'valor_unitario':1500}]})
        assert quote.status_code==201,quote.text
        assert client.put('/api/admin/orcamentos/'+quote.json()['id'],json={'status':'enviado','ui':{'stage':'negociacao'}}).json()['ui']['convidados']==120
        png=io.BytesIO();Image.new('RGB',(4,4)).save(png,format='PNG')
        frame=client.post('/api/admin/molduras',data={'nome':'Moldura UI','ui':'{"categoria":"Festa","formato":"10x15"}'},files={'file':('frame.png',png.getvalue(),'image/png')})
        assert frame.status_code==201,frame.text
        assert client.put('/api/admin/molduras/'+frame.json()['id'],json={'ativa':False,'ui':{'categoria':'Casamento'}}).json()['ui']['formato']=='10x15'
        prefs={'nomeTotem':'Meu Totem','contagem':'5','som':False}
        assert client.put('/api/admin/preferences/config',json=prefs).status_code==200
        assert all(client.get('/api/admin/preferences/config').json()[k]==v for k,v in prefs.items())
        assert client.get('/api/config').json()['contagem']=='5'
        assert client.get('/api/admin/dashboard/overview?periodo=Hoje').status_code==200
        assert client.get('/api/admin/reports/events?days=30').status_code==200
        with SessionLocal() as db:
            record=Session(status=SessionStatus.UPLOADED);db.add(record);db.commit();sid=record.id
        assert client.post('/api/admin/sessions/'+sid+'/cancel').status_code==200
        assert client.post('/api/admin/sessions/'+sid+'/cancel').status_code==409


def test_effect_disable_and_kiosk_event_link():
    from app.models import Efeito, Evento
    from app.tasks import process_photo_task
    with TestClient(app) as client:
        token=client.post('/api/admin/auth/login',json={'email':'test@example.com','password':'test-password'}).json()['access_token']
        client.headers['Authorization']='Bearer '+token
        customer=client.post('/api/admin/clientes',json={'nome':'Cliente totem'}).json()
        cid=customer['id']
        event=client.post('/api/admin/eventos',json={'nome':'Evento totem','cliente_id':cid,'data_evento':'2026-12-01T12:00:00'}).json()
        eid=event['id']
        with SessionLocal() as db:
            db.query(Efeito).update({Efeito.ativo:False});db.commit()
        assert client.get('/api/efeitos').json()==[]
        session=client.post('/api/session',json={'people_count':1,'evento_id':eid})
        assert session.status_code==200,session.text
        sid=session.json()['id']
        with SessionLocal() as db:
            row=db.get(Session,sid)
            assert row.evento_id==eid and row.cliente_id==cid
        assert client.post('/api/session',json={'evento_id':'missing'}).status_code==422
        assert client.post('/api/admin/sessions/'+sid+'/cancel').status_code==200
        assert process_photo_task.run(sid)['error']=='Sessão cancelada'


def test_selected_effect_is_forwarded_to_worker():
    from app.models import AdminPresentation, Efeito
    from app.tasks import process_photo_task
    with TestClient(app) as client:
        sid=client.post('/api/session',json={'people_count':1}).json()['id']
        png=io.BytesIO();Image.new('RGB',(8,8)).save(png,format='PNG')
        with patch('app.routes.session.process_photo_task.delay'):
            upload=client.post(f'/api/session/{sid}/upload',data={'effect_id':'cyberpunk'},files={'file':('capture.png',png.getvalue(),'image/png')})
        assert upload.status_code==200,upload.text
        with SessionLocal() as db:
            selection=db.get(AdminPresentation,'session-effect:'+sid)
            assert db.get(Efeito,selection.data['effect_id']).nome=='Cyberpunk'
        with patch('app.tasks.ai_service.generate_variations',return_value=(['/static/generated/test.jpg'],['Cyberpunk'],['test'])) as generate:
            result=process_photo_task.run(sid)
            assert len(generate.call_args.kwargs['efeitos'])==1
            assert generate.call_args.kwargs['efeitos'][0]['name']=='Cyberpunk'
        sid2=client.post('/api/session',json={}).json()['id']
        with patch('app.routes.session.process_photo_task.delay'):
            upload=client.post(f'/api/session/{sid2}/upload',data={'effect_id':'anime'},files={'file':('capture.png',png.getvalue(),'image/png')})
        assert upload.status_code==200,upload.text
        with SessionLocal() as db:
            anime=db.query(Efeito).filter(Efeito.nome=='Anime').one();anime.ativo=False;db.commit()
        sid3=client.post('/api/session',json={}).json()['id']
        assert client.post(f'/api/session/{sid3}/upload',data={'effect_id':'anime'},files={'file':('capture.png',png.getvalue(),'image/png')}).status_code==409
