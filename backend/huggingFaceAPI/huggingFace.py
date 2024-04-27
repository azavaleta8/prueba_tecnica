import requests
import time

class huggingFaceAPI:
    def __init__(self):
        self.base_url = 'https://api-inference.huggingface.co/models/finiteautomata'
        self.tokens = [
            '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',
            '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',
            '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',
            # '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',
            # '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',
            # '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',
        ]

    def post_data(self, endpoint, payload):
        url = f"{self.base_url}/{endpoint}"
        max_retries = 6
        retry_delay = 30  # segundos
        token_index = 0

        for retry_count in range(max_retries):

            try:

                headers = {"Authorization": f"Bearer {self.tokens[token_index]}"}
                response = requests.post(
                    url,
                    json=payload,
                    headers=headers
                )
                if response.status_code == 200:
                    data = response.json()
                    return data
                elif response.status_code == 503:
                    print("El servicio no está disponible. Esperando {} segundos para reintentar...".format(retry_delay))
                    time.sleep(retry_delay)
                elif response.status_code == 429:
                    token_index += 1
                    print("Respuesta 429: Cambiando al siguiente token y reintentando...")
                    if token_index >= len(self.tokens):
                        return None
                else:
                    print("Error HTTP: {}".format(response.status_code))
                    return None
                    
            except ValueError as e:
                print("Error de análisis JSON: {}".format(e))
                return None

        print("Se superó el número máximo de reintentos.")
        return None