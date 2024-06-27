import os
import csv
import re

# .csv 파일 읽기
def read_csv_file(csv_file):
    replacements = []
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        for row in reader:
            if len(row) == 2:
                old, new = row
                replacements.append((old.strip(), new.strip()))
    print(f"Read {len(replacements)} replacements from {csv_file}")
    return replacements

# 파일에서 문자열 치환하기
def replace_in_file(file_path, replacements):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    original_content = content
    replacements_made = False
    for old, new in replacements:
        # 대소문자 구분 없이 치환
        if re.search(re.escape(old), content, re.IGNORECASE):
            content = re.sub(re.escape(old), new, content, flags=re.IGNORECASE)
            replacements_made = True

    if not replacements_made:
        print(f"No replacements made in {file_path}")
    else:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Replacements made in {file_path}")

# 특정 확장자의 파일들에서 문자열 치환하기
def replace_in_files(directory, extensions, replacements):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                replace_in_file(file_path, replacements)

# 실행 부분
if __name__ == "__main__":
    csv_file = 'replace.csv'
    directory = '.'  # 현재 폴더
    extensions = ('.html', '.js', '.jsp')

    replacements = read_csv_file(csv_file)
    replace_in_files(directory, extensions, replacements)
    print("모든 파일에서 문자열 치환이 완료되었습니다.")
