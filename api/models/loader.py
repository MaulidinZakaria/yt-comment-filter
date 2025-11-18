from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_path = "./model"   # folder hasil training IndoBERT

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

def get_model():
    return tokenizer, model
