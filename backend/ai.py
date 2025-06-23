from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SimpleField,
    SearchFieldDataType,
    SearchableField,
    SearchField,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
    SemanticConfiguration,
    SemanticPrioritizedFields,
    SemanticField,
    SemanticSearch,
    SearchIndex,
    AzureOpenAIVectorizer,
    AzureOpenAIVectorizerParameters
)
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI
import os
import logging
from dotenv import load_dotenv, set_key
import base64
import json
from mimetypes import guess_type
import uuid

load_dotenv()

search_service_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
search_api_key = os.getenv("AZURE_SEARCH_KEY")


azure_endpoint = os.getenv("AZURE_OPENAI_API_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION")
model = os.getenv('AZURE_OPENAI_MODEL')

embedding_model = "text-embedding-3-small"

index_name = os.getenv('AZURE_SEARCH_INDEX_NAME')

env_file_path = '.env'

client = AzureOpenAI(
    api_key=api_key,
    api_version=api_version,
    base_url=f"{azure_endpoint}/openai/deployments/{model}",
)

embedding_client = AzureOpenAI(
    api_key=api_key,
    api_version=api_version,
    base_url=f"{azure_endpoint}/openai/deployments/{embedding_model}",
)

search_client = SearchClient(
    endpoint=search_service_endpoint,
    index_name=index_name,
    credential=AzureKeyCredential(search_api_key)
)

index_client = SearchIndexClient(
    endpoint=search_service_endpoint,
    credential=AzureKeyCredential(search_api_key)
)

def create_vector_search():
    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(name="myHnsw")
        ],
        profiles=[
            VectorSearchProfile(
                name="myHnswProfile",
                algorithm_configuration_name="myHnsw",
                vectorizer_name="myVectorizer"
            )
        ],
        vectorizers=[
            AzureOpenAIVectorizer(
                vectorizer_name="myVectorizer",
                parameters=AzureOpenAIVectorizerParameters(
                    resource_uri=azure_endpoint,
                    api_key=api_key,
                    deployment_id=embedding_model,
                    model_name=embedding_model
                )
            )
        ]
    )
    return vector_search

def create_index():
    index_schema = SearchIndex(
        name=index_name,
        fields=[
            SimpleField(name="chunk_id", type="Edm.String", sortable=True,
                        filterable=True, facetable=True, key=True),
            SearchableField(name="question", type="Edm.String",
                            searchable=True, retrievable=True),
            SearchableField(name="answer", type="Edm.String", 
                            searchable=False, retrievable=True),
            SearchField(
                name="contentVector",
                type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
                searchable=True,
                vector_search_dimensions=int(1536),
                vector_search_profile_name="myHnswProfile",
            )
        ]
    )
    try:
        index_schema.vector_search = create_vector_search()
        index_client.create_index(index_schema)
    except Exception as e:
        logging.error(f"Failed to create index: {e}")

def get_fitness_recommendation(image_paths, gender, age, weight):
    """
    Given a list of image file paths and user details,
    use GPT-4o vision to analyze the images and return personalized fitness recommendations.
    """
    encoded_images = []
    for img_path in image_paths:
        with open(img_path, "rb") as img_file:
            encoded = base64.b64encode(img_file.read()).decode('utf-8')
            encoded_images.append({
                "filename": os.path.basename(img_path),
                "data": encoded
            })

    prompt = (
        "You are an expert fitness and nutrition advisor. "
        "Analyze the provided images of a person and consider their personal details "
        "to provide highly personalized and actionable fitness and nutrition recommendations.\n\n"
        f"User Details:\n- Gender: {gender}\n- Age: {age}\n- Weight: {weight} lbs\n\n"
        "Based on the images and the user's details, please analyze their posture, estimated body composition, "
        "and any visible indicators. Then, provide a comprehensive plan covering:\n"
        "1.  **Workout Recommendations:** Suggest specific exercises, frequency, and intensity suitable for their profile.\n"
        "2.  **Nutrition Advice:** Offer dietary guidelines that would complement their fitness goals.\n"
        "3.  **Lifestyle Tips:** Include advice on posture correction, daily habits, or other relevant areas."
        "Be specific and actionable in your advice, and present it in a clear, easy-to-read format."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                *[
                    {"role": "user", "content": [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img['data']}"}}]} 
                    for img in encoded_images
                ]
            ],
            max_tokens=1024,
        )
        recommendation = response.choices[0].message.content
        return recommendation
    except Exception as e:
        logging.error(f"GPT-4o vision API error: {e}")
        return "An error occurred while generating fitness recommendations."