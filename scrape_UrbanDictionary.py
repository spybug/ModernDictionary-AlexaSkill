import urllib2, json, csv

def loop():
    filen = "words.csv"
    with open(filen, "wb") as csvfile:
        csvwriter = csv.writer(csvfile, dialect='excel', delimiter=",", quotechar='"', quoting=csv.QUOTE_ALL)
        csvwriter.writerow(["word", "definition"])
        for _ in xrange(200):
            getRandomWords(filen, csvwriter, csvfile)
            csvfile.flush()

def getRandomWords(filen, csvwriter, csvfile):
    url = "https://api.urbandictionary.com/v0/random"
    result = urllib2.urlopen(url).read()
    json_result = json.loads(result)
    for item in json_result['list']:
        word = item['word']
        word = word.replace("\r","").replace("\n", "").encode("utf-8")
        defin = item['definition']
        defin = defin.replace("\r","").replace("\n", "").encode("utf-8")
        csvwriter.writerow([word, defin])
            

if __name__ == "__main__":
    loop()
    print "completed"
