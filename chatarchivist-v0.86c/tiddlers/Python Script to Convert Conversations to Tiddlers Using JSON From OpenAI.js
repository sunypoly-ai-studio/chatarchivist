import json
import os
from zipfile import ZipFile
from datetime import datetime, timezone
import sys
import hashlib
import random
import string
import uuid
import re

def format_tiddlywiki_date(epoch_time):
    '''Convert epoch time to TiddlyWiki date format YYYYMMDDhhmmssss, using timezone-aware datetime.'''
    return datetime.fromtimestamp(epoch_time, timezone.utc).strftime('%Y%m%d%H%M%S0000')

def generate_random_string(length=8):
    '''Generate a random string of specified length.'''
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def markdown_to_tiddlywiki(text):
    '''Convert markdown text to TiddlyWiki format.'''
    # Convert bold
    text = re.sub(r'\*\*(.*?)\*\*', r"''\1''", text)
    text = re.sub(r'__(.*?)__', r"''\1''", text)

    # Convert italic
    text = re.sub(r'\*(.*?)\*', r'//\1//', text)
    text = re.sub(r'_(.*?)_', r'//\1//', text)

    # Convert headers
    for i in range(6, 0, -1):
        text = re.sub(r'^#{' + str(i) + r'}\s*(.*)', r'!' + str(i) + r' \1', text, flags=re.MULTILINE)

    # Convert inline code
    text = re.sub(r'`([^`]*)`', r'`\1`', text)

    # Convert code blocks
    text = re.sub(r'```(.*?)```', r'```\n\1\n```', text, flags=re.DOTALL)

    # Convert blockquotes
    text = re.sub(r'^>\s*(.*)', r'}', text, flags=re.MULTILINE)

    # Convert ordered lists
    def replace_ordered_list(match):
        items = match.group(0).split('\n')
        formatted_items = []
        for item in items:
            if item.strip():
                # Remove leading numbers and periods from the list item
                formatted_item = re.sub(r'^\d+\.\s+', '', item.strip())
                formatted_items.append(f'# {formatted_item}')
        return '\n'.join(formatted_items)

    text = re.sub(r'((\d+\.\s+.*\n?)+)', replace_ordered_list, text)

    # Convert unordered lists
    def replace_unordered_list(match):
        items = match.group(0).split('\n')
        formatted_items = []
        for item in items:
            if item.strip():
                # Remove leading asterisks from the list item
                formatted_item = re.sub(r'^\*\s+', '', item.strip())
                formatted_items.append(f'* {formatted_item}')
        return '\n'.join(formatted_items)

    text = re.sub(r'((\*\s+.*\n?)+)', replace_unordered_list, text)

    # Convert links
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'[[\1|\2]]', text)

    return text

def process_conversation_file(conversations):
    '''Process the conversations JSON data.'''
    all_tiddlers = []
    print("Processing conversations...")

    for conversation in conversations:
        if isinstance(conversation, dict):
            conversation_id = str(uuid.uuid4())
            print(f"Processing conversation ID: {conversation_id}")

            conversation_tiddler = {
                'title': conversation_id,
                'tags': 'chatgptconversation',
                'chatgptelement': 'conversation',
                'conversation_title': conversation.get('title', 'UnknownTitle')
            }
            all_tiddlers.append(conversation_tiddler)

            for i, (message_key, message_value) in enumerate(conversation.get('mapping', {}).items(), start=1):
                message = message_value.get('message', {})
                if message and message.get('create_time') is not None:
                    message_id = str(uuid.uuid4())
                    create_time = message['create_time']
                    formatted_timestamp = format_tiddlywiki_date(create_time)
                    title = f"conv{conversation_id}_msg{i}_{message_id}"

                    text_content = message.get('content', {}).get('parts', [''])[0]
                    tiddlywiki_text = markdown_to_tiddlywiki(text_content)

                    tiddler = {
                        'title': title,
                        'text': tiddlywiki_text,
                        'author': message.get('author', {}).get('role', 'unknown'),
                        'conversation_id': conversation_id,
                        'message_id': message_id,
                        'tags': 'chatgptmessage',
                        'timestamp': formatted_timestamp
                    }
                    all_tiddlers.append(tiddler)
                    print(f"Added tiddler: {title}")
        else:
            print(f"Warning: Invalid conversation format encountered: {type(conversation)}")

    print(f"Processed {len(all_tiddlers)} tiddlers")
    return all_tiddlers

def extract_and_convert_conversations(zip_path, output_directory):
    '''Extract conversations from the conversations.json file in a zip archive and convert to TiddlyWiki format.'''
    all_tiddlers = []
    print(f"Extracting from zip file: {zip_path}")
    
    with ZipFile(zip_path, 'r') as zip_ref:
        filenames = zip_ref.namelist()
        print(f"Files in zip: {filenames}")

        for filename in filenames:
            if filename.endswith('.json') and 'conversations.json' in filename:
                print(f"Processing file: {filename}")
                with zip_ref.open(filename) as file:
                    json_data = file.read().decode('utf-8')
                    try:
                        conversations = json.loads(json_data)
                        print(f"Loaded {len(conversations)} conversations")
                        tiddlers = process_conversation_file(conversations)
                        all_tiddlers.extend(tiddlers)
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON from {filename}: {e}")
                    except Exception as ex:
                        print(f"Error processing {filename}: {ex}")

    if not os.path.exists(output_directory):
        print(f"Output directory '{output_directory}' does not exist. Creating it.")
        os.makedirs(output_directory, exist_ok=True)
        print(f"Created output directory: {output_directory}")
    
    output_filename = 'output.json'
    output_path = os.path.join(output_directory, output_filename)

    print(f"Writing output to: {output_path}")
    
    with open(output_path, 'w') as outfile:
        json.dump(all_tiddlers, outfile, indent=4)
        print(f"Conversations extracted and saved to {output_path}")
    
    return output_path

if __name__ == '__main__':
    # Default paths for testing
    zip_file_path = 'path/to/your/conversations.zip'  # Replace with your ZIP file path
    output_dir = 'path/to/output/directory'  # Replace with your desired output directory

    # Use command-line arguments if provided
    if len(sys.argv) == 3:
        zip_file_path = sys.argv[1]
        output_dir = sys.argv[2]
    elif len(sys.argv) != 1:
        print("Usage: python script.py <path_to_zip_file> <output_directory>")
        sys.exit(1)

    if not os.path.isfile(zip_file_path):
        print(f"Error: Input zip file '{zip_file_path}' does not exist.")
        sys.exit(1)

    output_file_path = extract_and_convert_conversations(zip_file_path, output_dir)
    print(f'Conversations extracted and saved to {output_file_path}')
