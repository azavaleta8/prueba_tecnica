from django.db import models

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.email

class BatchData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=128, unique=True)
    size = models.IntegerField()
    processed_data = models.IntegerField()
    status = models.CharField(max_length=128)

    def __str__(self):
        return self.name

class Data(models.Model):
    batch = models.ForeignKey(BatchData, on_delete=models.CASCADE)
    text = models.TextField()
    likes = models.IntegerField()
    comments = models.IntegerField()
    shares = models.IntegerField()
    reactions = models.IntegerField()
    emotions = models.TextField()
    sentiments = models.TextField()
    processed = models.BooleanField()

    def __str__(self):
        return self.text
