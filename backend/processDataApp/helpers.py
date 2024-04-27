import re

def ParseData(row):
    row = row.strip('"\n')
    pattern = r'"",\d+,\d+,\d+,\d+";+'
    matches = re.findall(pattern, row)
    if len(matches) > 0:
        return FixFormat(row)
        # fixed_format.append(fixed_line)
        # continue

    pattern = r',\d+,\d+,\d+,\d+;+'
    matches = re.findall(pattern, row)
    if len(matches) > 0:
        return FixFormat(row)
        # fixed_format.append(fixed_line)
        # continue
    
    row = row.replace(r';','')
    row = row.strip('"\r')
    
    if row == '':
        return None

    pattern = r'^\d+,'
    text = re.split(pattern, row)
    text = text[-1]
    text = text.strip('"')
    return [text] + [0,0,0,0]

    # name = row[0]
    # age = int(row[1])
    # email = row[2]
    # person = Person(name=name, age=age, email=email)
    # person.save()



def FixFormat(row):
    row = row.replace(r';','')
    row = row.strip('"\r')

    pattern = r',\d+,\d+,\d+,\d+'
    text = re.split(pattern, row)
    text = text[0]
    numbers = re.findall(pattern, row)
    numbers = numbers[0]
    numbers = numbers.split(',')
    numbers.pop(0)

    pattern = r'^\d+,'
    text = re.split(pattern, text)
    text = text[-1]
    text = text.strip('"')

    return [text] + numbers
