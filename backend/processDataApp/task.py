from time import sleep
from celery import shared_task
from .serializers import DataSerializer
from .models import BatchData, Data
from huggingFaceAPI.huggingFace import huggingFaceAPI
import csv
import json

@shared_task
def process_csv_data(batch_id, dataset):
    
    batch_data = BatchData.objects.get(id=batch_id)
    hgAPI = huggingFaceAPI()
    invalid_count = 0
     
    for row in dataset:
        
        if row[0] == '':
            invalid_count += 1
            continue
        
        processed = False
        
        emotionResponse = hgAPI.post_data(
            'beto-emotion-analysis', 
            f'{{"inputs":{row[0]}}}'
        )
        sentimentResponse = hgAPI.post_data(
            'beto-sentiment-analysis', 
            f'{{"inputs":{row[0]}}}'
        )

        sentiments = json.dumps([
            {'label': 'NEU', 'score': 0}, 
            {'label': 'POS', 'score': 0}, 
            {'label': 'NEG', 'score': 0}
        ])

        emotions = json.dumps([
            {'label': 'others', 'score': 0}, 
            {'label': 'joy', 'score': 0}, 
            {'label': 'surprise', 'score': 0}, 
            {'label': 'anger', 'score': 0}, 
            {'label': 'sadness', 'score': 0}, 
            {'label': 'fear', 'score': 0}, 
            {'label': 'disgust', 'score': 0}
        ])
        
        if emotionResponse is not None and sentimentResponse is not None:
            emotions = json.dumps(emotionResponse[0])
            sentiments = json.dumps(sentimentResponse[0])
            processed = True
        else:
            print(f"Error al procesar el texto: {row[0][slice(0, 10)]}")

        serializer = DataSerializer(data={
            'batch': batch_id,
            'text': row[0],
            'likes': row[1],
            'comments': row[2],
            'shares': row[3],
            'reactions': row[4],
            'emotions': emotions,
            'sentiments': sentiments,
            'processed' : processed
        })

        if not serializer.is_valid():
            print(serializer)
            invalid_count += 1
            continue
        
        if processed:
            batch_data.processed_data += 1

        try:
            # Guarda los cambios en la base de datos
            batch_data.save()
            serializer.save()
        except Exception as e:
            print(f"Error al actualizar el campo: {e}")

    try:
        batch_data.size -= invalid_count
        if  batch_data.processed_data == batch_data.size:
            batch_data.status = 'Finished'
        else:
            batch_data.status = 'Imcomplete'

        batch_data.save()
    except Exception as e:
        print(f"Error al actualizar el campo: {e}")


    print(f"Se procesaron {batch_data.processed_data} instancias de Data.")


@shared_task
def process_unprocessed_data(batch_id):
    # Obtener todas las instancias de Data con processed=False para el batch_id dado
    unprocessed_data = Data.objects.filter(batch=batch_id, processed=False)
    batch_data = BatchData.objects.get(id=batch_id)

    hgAPI = huggingFaceAPI()
    processed_count = 0

    for data_instance in unprocessed_data:
        text = data_instance.text

        emotionResponse = hgAPI.post_data(
            'beto-emotion-analysis', 
            f'{{"inputs": "{text}"}}'
        )
        sentimentResponse = hgAPI.post_data(
            'beto-sentiment-analysis', 
            f'{{"inputs": "{text}"}}'
        )

        if emotionResponse is not None and sentimentResponse is not None:
            emotions = json.dumps(emotionResponse[0])
            sentiments = json.dumps(sentimentResponse[0])

            data_instance.processed = True
            processed_count += 1
            batch_data.processed_data += 1

            print(f"Procesando el texto: {text[slice(0, 10)]}")

        else:

            print(f"Error al procesar el texto: {text[slice(0, 10)]}")
            continue

        # Actualizar los campos emotions, sentiments y processed en la instancia de Data
        data_instance.emotions = emotions
        data_instance.sentiments = sentiments
        
        try:
            batch_data.save()
            data_instance.save()
        except Exception as e:
            print(f"Error al actualizar el campo: {e}")

    try:
        if  batch_data.processed_data == batch_data.size:
            batch_data.status = 'Finished'
        else:
            batch_data.status = 'Imcomplete'

        batch_data.save()
    except Exception as e:
        print(f"Error al actualizar el campo: {e}")


    print(f"Se procesaron {processed_count} instancias de Data.")

