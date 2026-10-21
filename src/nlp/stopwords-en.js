/* Stopword Bahasa Inggris yang Diperluas (Standar NLTK/Lucene + Teks Ilmiah/Publikasi)
   Catatan: Kata domain teknis penting (mis. 'game', 'learning', 'network', 'system', 'tutor', 'ai')
   tetap dipertahankan dan TIDAK dijadikan stopword. */
(function () {
  const ENGLISH_STOPWORDS = new Set([
    "a", "about", "above", "across", "after", "afterwards", "again", "against", "all", "almost",
    "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an",
    "and", "another", "any", "anyhow", "anyone", "anything", "anyway", "anywhere", "are",
    "arent", "around", "as", "at", "back", "be", "became", "because", "become", "becomes",
    "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides",
    "between", "beyond", "both", "bottom", "but", "by",
    "can", "cannot", "cant", "co", "could", "couldnt",
    "did", "didnt", "do", "does", "doesnt", "doing", "dont", "done", "down", "due", "during",
    "each", "eg", "either", "else", "elsewhere", "enough", "etc", "even", "ever", "every",
    "everyone", "everything", "everywhere", "except",
    "few", "for", "former", "formerly", "from", "further", "furthermore",
    "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hence", "her",
    "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself",
    "his", "how", "however", "hundred",
    "i", "ie", "if", "in", "inc", "indeed", "inside", "into", "is", "isnt", "it", "its", "itself",
    "just",
    "keep", "keeps",
    "last", "latter", "latterly", "least", "less", "let", "like", "ltd",
    "made", "many", "may", "maybe", "me", "meanwhile", "might", "more", "moreover", "most",
    "mostly", "much", "must", "my", "myself",
    "namely", "neither", "never", "nevertheless", "next", "no", "nobody", "none", "noone",
    "nor", "not", "nothing", "now", "nowhere",
    "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others",
    "otherwise", "our", "ours", "ourselves", "out", "outside", "over", "own",
    "per", "perhaps", "please", "put",
    "rather", "re",
    "same", "see", "seem", "seemed", "seeming", "seems", "several", "she", "should", "shouldnt",
    "since", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere",
    "still", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "thence", "there",
    "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "this", "those",
    "though", "through", "throughout", "thru", "thus", "to", "together", "too", "toward", "towards",
    "under", "until", "unto", "up", "upon", "us", "using",
    "various", "very", "via",
    "was", "wasnt", "we", "well", "were", "werent", "what", "whatever", "when", "whence",
    "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever",
    "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why",
    "will", "with", "within", "without", "wont", "would", "wouldnt",
    "yet", "you", "your", "yours", "yourself", "yourselves",
    // Terminologi penerbitan / artikel ilmiah
    "vol", "no", "pp", "issue", "et", "al", "doi"
  ]);

  ATLAS.nlp.ENGLISH_STOPWORDS = ENGLISH_STOPWORDS;
})();
