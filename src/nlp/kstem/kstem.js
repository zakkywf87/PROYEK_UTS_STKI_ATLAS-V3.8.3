/*
Copyright © 2003,
Center for Intelligent Information Retrieval,
University of Massachusetts, Amherst.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

3. The names "Center for Intelligent Information Retrieval" and
"University of Massachusetts" must not be used to endorse or promote products
derived from this software without prior written permission. To obtain
permission, contact info@ciir.cs.umass.edu.

THIS SOFTWARE IS PROVIDED BY UNIVERSITY OF MASSACHUSETTS AND OTHER CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
*/
/* KStem (Krovetz Stemmer) untuk Bahasa Inggris.
   Port ke JavaScript dari org.apache.lucene.analysis.en.KStemmer (Apache Lucene, Apache License 2.0),
   yang merupakan port Java dari KStem Bob Krovetz (CIIR, UMass Amherst; lisensi BSD di atas).
   Terjemahan dilakukan mekanis; logika algoritma tidak diubah. Input wajib huruf kecil a-z. */
(function () {
  const MaxWordLen = 50;
  const ization = "ization";
  const ition = "ition";
  const ation = "ation";
  const ication = "ication";
  // Pengganti OpenStringBuilder (Lucene): penampung karakter yang dapat dipotong dan ditambah
  class OpenStringBuilder {
    constructor() { this.c = []; }
    length() { return this.c.length; }
    size() { return this.c.length; }
    charAt(i) { return this.c[i]; }
    setCharAt(i, ch) { this.c[i] = ch; }
    setLength(n) { this.c.length = n; }
    unsafeWrite(ch) { this.c.push(ch); }
    append(s) { for (const ch of String(s)) this.c.push(ch); }
    reset() { this.c.length = 0; }
    toString() { return this.c.join(''); }
  }

  // Kamus: pengecualian -> dirinya sendiri; konflasi/negara -> akar tertentu; leksikon -> kata dasar (root null)
  const { exceptionWords, directConflations, countryNationality, supplementDict, properNouns } = ATLAS.nlp.kstemLists;
  const dict_ht = new Map();
  const defaultEntry = { root: null, exception: false };
  exceptionWords.forEach(w => dict_ht.set(w, { root: w, exception: true }));
  directConflations.forEach(([a, b]) => dict_ht.set(a, { root: b, exception: false }));
  countryNationality.forEach(([a, b]) => dict_ht.set(a, { root: b, exception: false }));
  [ATLAS.nlp.kstemLexicon, supplementDict, properNouns].forEach(list => list.forEach(w => dict_ht.set(w, defaultEntry)));

class KStemmer {
  word = new OpenStringBuilder();
  j = 0;
  k = 0;
  matchedEntry = null;
  result = null;

  endsIn(...a) {
    const word = this.word;
    if (a.length === 1) { // sufiks berupa string
      const s = a[0];
      if (s.length > this.k) return false;
      const r = word.length() - s.length;
      this.j = this.k;
      for (let r1 = r, i = 0; i < s.length; i++, r1++) if (s[i] !== word.charAt(r1)) return false;
      this.j = r - 1;
      return true;
    }
    const n = a.length;
    if (n > this.k) return false;
    for (let i = 0; i < n; i++) if (word.charAt(this.k - n + 1 + i) !== a[i]) return false;
    this.j = this.k - n;
    return true;
  }

  penultChar() {
    return this.word.charAt(this.k - 1);
  }

  isVowel(index) {
    return !this.isCons(index);
  }

  isCons(index) {
    let ch;

    ch = this.word.charAt(index);

    if ((ch == 'a') || (ch == 'e') || (ch == 'i') || (ch == 'o') || (ch == 'u')) return false;
    if ((ch != 'y') || (index == 0)) return true;
    else return (!this.isCons(index - 1));
  }

  isAlpha(ch) {
    return ch >= 'a' && ch <= 'z'; // terms must be lowercased already
  }

  /* length of stem within word */
  stemLength() {
    return this.j + 1;
  }

  wordInDict() {
    /*
     * if (matchedEntry != null) { if (dict_ht.get(word.getArray(), 0,
     * word.size()) != matchedEntry) {
     * System.out.println("Uh oh... cached entry doesn't match"); } return
     * matchedEntry; }
     */
    if (this.matchedEntry != null) return this.matchedEntry;
    let e = dict_ht.get(this.word.toString());
    if (e != null && !e.exception) {
      this.matchedEntry = e; // only cache if it's not an exception.
    }
    // lookups.add(word.toString());
    return e;
  }

  /* Convert plurals to singular form, and '-ies' to 'y' */
  plural() {
    if (this.word.charAt(this.k) == 's') {
      if (this.endsIn('i', 'e', 's')) {
        this.word.setLength(this.j + 3);
        this.k--;
        if (this.lookup()) /* ensure calories -> calorie */ return;
        this.k++;
        this.word.unsafeWrite('s');
        this.setSuffix("y");
        this.lookup();
      } else if (this.endsIn('e', 's')) {
        /* try just removing the "s" */
        this.word.setLength(this.j + 2);
        this.k--;

        /*
         * note: don't check for exceptions here. So, `aides' -> `aide', but
         * `aided' -> `aid'. The exception for double s is used to prevent
         * crosses -> crosse. This is actually correct if crosses is a plural
         * noun (a type of racket used in lacrosse), but the verb is much more
         * common
         */

        /*
         * YCS: this was the one place where lookup was not followed by return.
         * So restructure it. if ((j>0)&&(lookup(word.toString())) &&
         * !((word.charAt(j) == 's') && (word.charAt(j-1) == 's'))) return;
         */
        let tryE = this.j > 0 && !((this.word.charAt(this.j) == 's') && (this.word.charAt(this.j - 1) == 's'));
        if (tryE && this.lookup()) return;

        /* try removing the "es" */

        this.word.setLength(this.j + 1);
        this.k--;
        if (this.lookup()) return;

        /* the default is to retain the "e" */
        this.word.unsafeWrite('e');
        this.k++;

        if (!tryE) this.lookup(); // if we didn't try the "e" ending before
        return;
      } else {
        if (this.word.length() > 3 && this.penultChar() != 's' && !this.endsIn('o', 'u', 's')) {
          /* unless the word ends in "ous" or a double "s", remove the final "s" */

          this.word.setLength(this.k);
          this.k--;
          this.lookup();
        }
      }
    }
  }

  setSuffix(s) {
    this.setSuff(s, s.length);
  }

  /* replace old suffix with s */
  setSuff(s, len) {
    this.word.setLength(this.j + 1);
    for (let l = 0; l < len; l++) {
      this.word.unsafeWrite(s.charAt(l));
    }
    this.k = this.j + len;
  }

  /* Returns true if the word is found in the dictionary */
  // almost all uses of lookup() return immediately and are
  // followed by another lookup in the dict. Store the match
  // to avoid this double lookup.

  lookup() {
    /*
     * debugging code String thisLookup = word.toString(); boolean added =
     * lookups.add(thisLookup); if (!added) {
     * System.out.println("######extra lookup:" + thisLookup); // occaasional
     * extra lookups aren't necessarily errors... could happen by diff
     * manipulations // throw new RuntimeException("######extra lookup:" +
     * thisLookup); } else { // System.out.println("new lookup:" + thisLookup);
     * }
     */

    this.matchedEntry = dict_ht.get(this.word.toString());
    return this.matchedEntry != null;
  }

  // Set<String> lookups = new HashSet<>();

  /* convert past tense (-ed) to present, and `-ied' to `y' */
  pastTense() {
    /*
     * Handle words less than 5 letters with a direct mapping This prevents
     * (fled -> fl).
     */
    if (this.word.length() <= 4) return;

    if (this.endsIn('i', 'e', 'd')) {
      this.word.setLength(this.j + 3);
      this.k--;
      if (this.lookup()) /* we almost always want to convert -ied to -y, but */
        return; /* this isn't true for short words (died->die) */
      this.k++; /* I don't know any long words that this applies to, */
      this.word.unsafeWrite('d'); /* but just in case... */
      this.setSuffix("y");
      this.lookup();
      return;
    }

    /* the vowelInStem() is necessary so we don't stem acronyms */
    if (this.endsIn('e', 'd') && this.vowelInStem()) {
      /* see if the root ends in `e' */
      this.word.setLength(this.j + 2);
      this.k = this.j + 1;

      let entry = this.wordInDict();
      if (entry != null) if (!entry.exception) /*
                                                * if it's in the dictionary and
                                                * not an exception
                                                */ return;

      /* try removing the "ed" */
      this.word.setLength(this.j + 1);
      this.k = this.j;
      if (this.lookup()) return;

      /*
       * try removing a doubled consonant. if the root isn't found in the
       * dictionary, the default is to leave it doubled. This will correctly
       * capture `backfilled' -> `backfill' instead of `backfill' ->
       * `backfille', and seems correct most of the time
       */

      if (this.doubleC(this.k)) {
        this.word.setLength(this.k);
        this.k--;
        if (this.lookup()) return;
        this.word.unsafeWrite(this.word.charAt(this.k));
        this.k++;
        this.lookup();
        return;
      }

      /* if we have a `un-' prefix, then leave the word alone */
      /* (this will sometimes screw up with `under-', but we */
      /* will take care of that later) */

      if ((this.word.charAt(0) == 'u') && (this.word.charAt(1) == 'n')) {
        this.word.unsafeWrite('e');
        this.word.unsafeWrite('d');
        this.k = this.k + 2;
        // nolookup()
        return;
      }

      /*
       * it wasn't found by just removing the `d' or the `ed', so prefer to end
       * with an `e' (e.g., `microcoded' -> `microcode').
       */

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e');
      this.k = this.j + 1;
      // nolookup() - we already tried the "e" ending
      return;
    }
  }

  /* return TRUE if word ends with a double consonant */
  doubleC(i) {
    if (i < 1) return false;

    if (this.word.charAt(i) != this.word.charAt(i - 1)) return false;
    return (this.isCons(i));
  }

  vowelInStem() {
    for (let i = 0; i < this.stemLength(); i++) {
      if (this.isVowel(i)) return true;
    }
    return false;
  }

  /* handle `-ing' endings */
  aspect() {
    /*
     * handle short words (aging -> age) via a direct mapping. This prevents
     * (thing -> the) in the version of this routine that ignores inflectional
     * variants that are mentioned in the dictionary (when the root is also
     * present)
     */

    if (this.word.length() <= 5) return;

    /* the vowelinstem() is necessary so we don't stem acronyms */
    if (this.endsIn('i', 'n', 'g') && this.vowelInStem()) {

      /* try adding an `e' to the stem and check against the dictionary */
      this.word.setCharAt(this.j + 1, 'e');
      this.word.setLength(this.j + 2);
      this.k = this.j + 1;

      let entry = this.wordInDict();
      if (entry != null) {
        if (!entry.exception) /* if it's in the dictionary and not an exception */ return;
      }

      /* adding on the `e' didn't work, so remove it */
      this.word.setLength(this.k);
      this.k--; /* note that `ing' has also been removed */

      if (this.lookup()) return;

      /* if I can remove a doubled consonant and get a word, then do so */
      if (this.doubleC(this.k)) {
        this.k--;
        this.word.setLength(this.k + 1);
        if (this.lookup()) return;
        this.word.unsafeWrite(this.word.charAt(this.k)); /* restore the doubled consonant */

        /* the default is to leave the consonant doubled */
        /* (e.g.,`fingerspelling' -> `fingerspell'). Unfortunately */
        /* `bookselling' -> `booksell' and `mislabelling' -> `mislabell'). */
        /* Without making the algorithm significantly more complicated, this */
        /* is the best I can do */
        this.k++;
        this.lookup();
        return;
      }

      /*
       * the word wasn't in the dictionary after removing the stem, and then
       * checking with and without a final `e'. The default is to add an `e'
       * unless the word ends in two consonants, so `microcoding' ->
       * `microcode'. The two consonants restriction wouldn't normally be
       * necessary, but is needed because we don't try to deal with prefixes and
       * compounds, and most of the time it is correct (e.g., footstamping ->
       * footstamp, not footstampe; however, decoupled -> decoupl). We can
       * prevent almost all of the incorrect stems if we try to do some prefix
       * analysis first
       */

      if ((this.j > 0) && this.isCons(this.j) && this.isCons(this.j - 1)) {
        this.k = this.j;
        this.word.setLength(this.k + 1);
        // nolookup() because we already did according to the comment
        return;
      }

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e');
      this.k = this.j + 1;
      // nolookup(); we already tried an 'e' ending
      return;
    }
  }

  /*
   * this routine deals with -ity endings. It accepts -ability, -ibility, and
   * -ality, even without checking the dictionary because they are so
   * productive. The first two are mapped to -ble, and the -ity is remove for
   * the latter
   */
  ityEndings() {
    let old_k = this.k;

    if (this.endsIn('i', 't', 'y')) {
      this.word.setLength(this.j + 1); /* try just removing -ity */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.unsafeWrite('e'); /* try removing -ity and adding -e */
      this.k = this.j + 1;
      if (this.lookup()) return;
      this.word.setCharAt(this.j + 1, 'i');
      this.word.append("ty");
      this.k = old_k;
      /*
       * the -ability and -ibility endings are highly productive, so just accept
       * them
       */
      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'i') && (this.word.charAt(this.j) == 'l')) {
        this.word.setLength(this.j - 1);
        this.word.append("le"); /* convert to -ble */
        this.k = this.j;
        this.lookup();
        return;
      }

      /* ditto for -ivity */
      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'i') && (this.word.charAt(this.j) == 'v')) {
        this.word.setLength(this.j + 1);
        this.word.unsafeWrite('e'); /* convert to -ive */
        this.k = this.j + 1;
        this.lookup();
        return;
      }
      /* ditto for -ality */
      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'a') && (this.word.charAt(this.j) == 'l')) {
        this.word.setLength(this.j + 1);
        this.k = this.j;
        this.lookup();
        return;
      }

      /*
       * if the root isn't in the dictionary, and the variant *is* there, then
       * use the variant. This allows `immunity'->`immune', but prevents
       * `capacity'->`capac'. If neither the variant nor the root form are in
       * the dictionary, then remove the ending as a default
       */

      if (this.lookup()) return;

      /* the default is to remove -ity altogether */
      this.word.setLength(this.j + 1);
      this.k = this.j;
      // nolookup(), we already did it.
      return;
    }
  }

  /* handle -ence and -ance */
  nceEndings() {
    let old_k = this.k;
    let word_char;

    if (this.endsIn('n', 'c', 'e')) {
      word_char = this.word.charAt(this.j);
      if (!((word_char == 'e') || (word_char == 'a'))) return;
      this.word.setLength(this.j);
      this.word.unsafeWrite('e'); /* try converting -e/ance to -e (adherance/adhere) */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.setLength(this.j); /*
                          * try removing -e/ance altogether
                          * (disappearance/disappear)
                          */
      this.k = this.j - 1;
      if (this.lookup()) return;
      this.word.unsafeWrite(word_char); /* restore the original ending */
      this.word.append("nce");
      this.k = old_k;
      // nolookup() because we restored the original ending
    }
    return;
  }

  /* handle -ness */
  nessEndings() {
    if (this.endsIn('n', 'e', 's', 's')) {
      /*
       * this is a very productive endings, so
       * just accept it
       */
      this.word.setLength(this.j + 1);
      this.k = this.j;
      if (this.word.charAt(this.j) == 'i') this.word.setCharAt(this.j, 'y');
      this.lookup();
    }
    return;
  }

  /* handle -ism */
  ismEndings() {
    if (this.endsIn('i', 's', 'm')) {
      /*
       * this is a very productive ending, so just
       * accept it
       */
      this.word.setLength(this.j + 1);
      this.k = this.j;
      this.lookup();
    }
    return;
  }

  /* this routine deals with -ment endings. */
  mentEndings() {
    let old_k = this.k;

    if (this.endsIn('m', 'e', 'n', 't')) {
      this.word.setLength(this.j + 1);
      this.k = this.j;
      if (this.lookup()) return;
      this.word.append("ment");
      this.k = old_k;
      // nolookup
    }
    return;
  }

  /* this routine deals with -ize endings. */
  izeEndings() {
    let old_k = this.k;

    if (this.endsIn('i', 'z', 'e')) {
      this.word.setLength(this.j + 1); /* try removing -ize entirely */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.unsafeWrite('i');

      if (this.doubleC(this.j)) {
        /* allow for a doubled consonant */
        this.word.setLength(this.j);
        this.k = this.j - 1;
        if (this.lookup()) return;
        this.word.unsafeWrite(this.word.charAt(this.j - 1));
      }

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e'); /* try removing -ize and adding -e */
      this.k = this.j + 1;
      if (this.lookup()) return;
      this.word.setLength(this.j + 1);
      this.word.append("ize");
      this.k = old_k;
      // nolookup()
    }
    return;
  }

  /* handle -ency and -ancy */
  ncyEndings() {
    if (this.endsIn('n', 'c', 'y')) {
      if (!((this.word.charAt(this.j) == 'e') || (this.word.charAt(this.j) == 'a'))) return;
      this.word.setCharAt(this.j + 2, 't'); /* try converting -ncy to -nt */
      this.word.setLength(this.j + 3);
      this.k = this.j + 2;

      if (this.lookup()) return;

      this.word.setCharAt(this.j + 2, 'c'); /* the default is to convert it to -nce */
      this.word.unsafeWrite('e');
      this.k = this.j + 3;
      this.lookup();
    }
    return;
  }

  /* handle -able and -ible */
  bleEndings() {
    let old_k = this.k;
    let word_char;

    if (this.endsIn('b', 'l', 'e')) {
      if (!((this.word.charAt(this.j) == 'a') || (this.word.charAt(this.j) == 'i'))) return;
      word_char = this.word.charAt(this.j);
      this.word.setLength(this.j); /* try just removing the ending */
      this.k = this.j - 1;
      if (this.lookup()) return;
      if (this.doubleC(this.k)) {
        /* allow for a doubled consonant */
        this.word.setLength(this.k);
        this.k--;
        if (this.lookup()) return;
        this.k++;
        this.word.unsafeWrite(this.word.charAt(this.k - 1));
      }
      this.word.setLength(this.j);
      this.word.unsafeWrite('e'); /* try removing -a/ible and adding -e */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.setLength(this.j);
      this.word.append("ate"); /* try removing -able and adding -ate */
      /* (e.g., compensable/compensate) */
      this.k = this.j + 2;
      if (this.lookup()) return;
      this.word.setLength(this.j);
      this.word.unsafeWrite(word_char); /* restore the original values */
      this.word.append("ble");
      this.k = old_k;
      // nolookup()
    }
    return;
  }

  /*
   * handle -ic endings. This is fairly straightforward, but this is also the
   * only place we try *expanding* an ending, -ic -> -ical. This is to handle
   * cases like `canonic' -> `canonical'
   */
  icEndings() {
    if (this.endsIn('i', 'c')) {
      this.word.setLength(this.j + 3);
      this.word.append("al"); /* try converting -ic to -ical */
      this.k = this.j + 4;
      if (this.lookup()) return;

      this.word.setCharAt(this.j + 1, 'y'); /* try converting -ic to -y */
      this.word.setLength(this.j + 2);
      this.k = this.j + 1;
      if (this.lookup()) return;

      this.word.setCharAt(this.j + 1, 'e'); /* try converting -ic to -e */
      if (this.lookup()) return;

      this.word.setLength(this.j + 1); /* try removing -ic altogether */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.append("ic"); /* restore the original ending */
      this.k = this.j + 2;
      // nolookup()
    }
    return;
  }


  /* handle some derivational endings */
  /*
   * this routine deals with -ion, -ition, -ation, -ization, and -ication. The
   * -ization ending is always converted to -ize
   */
  ionEndings() {
    let old_k = this.k;
    if (!this.endsIn('i', 'o', 'n')) {
      return;
    }

    if (this.endsIn(ization)) {
      /*
       * the -ize ending is very productive, so simply
       * accept it as the root
       */
      this.word.setLength(this.j + 3);
      this.word.unsafeWrite('e');
      this.k = this.j + 3;
      this.lookup();
      return;
    }

    if (this.endsIn(ition)) {
      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e');
      this.k = this.j + 1;
      if (this.lookup()) {
        // remove -ition and add `e', and check against the
        return; /* (e.g., definition->define, opposition->oppose) */
      }

      /* restore original values */
      this.word.setLength(this.j + 1);
      this.word.append("ition");
      this.k = old_k;
      // nolookup()
    } else if (this.endsIn(ation)) {
      this.word.setLength(this.j + 3);
      this.word.unsafeWrite('e');
      this.k = this.j + 3;
      if (this.lookup()) {
        /* remove -ion and add `e', and check against the dictionary */
        return; /* (elimination -> eliminate) */
      }

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e');
      // remove -ation and add `e', and check against the dictionary
      this.k = this.j + 1;
      if (this.lookup()) return;

      this.word.setLength(this.j + 1);
      // just remove -ation (resignation->resign) and check dictionary
      this.k = this.j;
      if (this.lookup()) return;

      /* restore original values */
      this.word.setLength(this.j + 1);
      this.word.append("ation");
      this.k = old_k;
      // nolookup()

    }

    /*
     * test -ication after -ation is attempted (e.g., `complication->complicate'
     * rather than `complication->comply')
     */

    if (this.endsIn(ication)) {
      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('y');
      this.k = this.j + 1;
      if (this.lookup()) {
        // remove -ication and add `y', and check against the dictionary
        return; /* (e.g., amplification -> amplify) */
      }

      /* restore original values */
      this.word.setLength(this.j + 1);
      this.word.append("ication");
      this.k = old_k;
      // nolookup()
    }

    // if (endsIn(ion)) {
    if (true) { // we checked for this earlier... just need to set "j"
      this.j = this.k - 3; // YCS

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e');
      this.k = this.j + 1;
      if (this.lookup()) /* remove -ion and add `e', and check against the dictionary */ return;

      this.word.setLength(this.j + 1);
      this.k = this.j;
      if (this.lookup()) /* remove -ion, and if it's found, treat that as the root */ return;

      /* restore original values */
      this.word.setLength(this.j + 1);
      this.word.append("ion");
      this.k = old_k;
      // nolookup()
    }

    // nolookup(); all of the other paths restored original values
    return;
  }

  /*
   * this routine deals with -er, -or, -ier, and -eer. The -izer ending is
   * always converted to -ize
   */
  erAndOrEndings() {
    let old_k = this.k;

    if (this.word.charAt(this.k) != 'r') return; // YCS

    let word_char; /* so we can remember if it was -er or -or */

    if (this.endsIn('i', 'z', 'e', 'r')) {
      /*
       * -ize is very productive, so accept it
       * as the root
       */
      this.word.setLength(this.j + 4);
      this.k = this.j + 3;
      this.lookup();
      return;
    }

    if (this.endsIn('e', 'r') || this.endsIn('o', 'r')) {
      word_char = this.word.charAt(this.j + 1);
      if (this.doubleC(this.j)) {
        this.word.setLength(this.j);
        this.k = this.j - 1;
        if (this.lookup()) return;
        this.word.unsafeWrite(this.word.charAt(this.j - 1)); /* restore the doubled consonant */
      }

      if (this.word.charAt(this.j) == 'i') {
        /* do we have a -ier ending? */
        this.word.setCharAt(this.j, 'y');
        this.word.setLength(this.j + 1);
        this.k = this.j;
        if (this.lookup()) /* yes, so check against the dictionary */ return;
        this.word.setCharAt(this.j, 'i'); /* restore the endings */
        this.word.unsafeWrite('e');
      }

      if (this.word.charAt(this.j) == 'e') {
        /* handle -eer */
        this.word.setLength(this.j);
        this.k = this.j - 1;
        if (this.lookup()) return;
        this.word.unsafeWrite('e');
      }

      this.word.setLength(this.j + 2); /* remove the -r ending */
      this.k = this.j + 1;
      if (this.lookup()) return;
      this.word.setLength(this.j + 1); /* try removing -er/-or */
      this.k = this.j;
      if (this.lookup()) return;
      this.word.unsafeWrite('e'); /* try removing -or and adding -e */
      this.k = this.j + 1;
      if (this.lookup()) return;
      this.word.setLength(this.j + 1);
      this.word.unsafeWrite(word_char);
      this.word.unsafeWrite('r'); /* restore the word to the way it was */
      this.k = old_k;
      // nolookup()
    }
  }

  /*
   * this routine deals with -ly endings. The -ally ending is always converted
   * to -al Sometimes this will temporarily leave us with a non-word (e.g.,
   * heuristically maps to heuristical), but then the -al is removed in the next
   * step.
   */
  lyEndings() {
    let old_k = this.k;

    if (this.endsIn('l', 'y')) {

      this.word.setCharAt(this.j + 2, 'e'); /* try converting -ly to -le */

      if (this.lookup()) return;
      this.word.setCharAt(this.j + 2, 'y');

      this.word.setLength(this.j + 1); /* try just removing the -ly */
      this.k = this.j;

      if (this.lookup()) return;

      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'a') && (this.word.charAt(this.j) == 'l')) /*
                                                                              * always
                                                                              * convert
                                                                              * -
                                                                              * ally
                                                                              * to
                                                                              * -
                                                                              * al
                                                                              */ return;
      this.word.append("ly");
      this.k = old_k;

      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'a') && (this.word.charAt(this.j) == 'b')) {
        /*
         * always
         * convert
         * -
         * ably
         * to
         * -
         * able
         */
        this.word.setCharAt(this.j + 2, 'e');
        this.k = this.j + 2;
        return;
      }

      if (this.word.charAt(this.j) == 'i') {
        /* e.g., militarily -> military */
        this.word.setLength(this.j);
        this.word.unsafeWrite('y');
        this.k = this.j;
        if (this.lookup()) return;
        this.word.setLength(this.j);
        this.word.append("ily");
        this.k = old_k;
      }

      this.word.setLength(this.j + 1); /* the default is to remove -ly */

      this.k = this.j;
      // nolookup()... we already tried removing the "ly" variant
    }
    return;
  }

  /*
   * this routine deals with -al endings. Some of the endings from the previous
   * routine are finished up here.
   */
  alEndings() {
    let old_k = this.k;

    if (this.word.length() < 4) return;
    if (this.endsIn('a', 'l')) {
      this.word.setLength(this.j + 1);
      this.k = this.j;
      if (this.lookup()) /* try just removing the -al */ return;

      if (this.doubleC(this.j)) {
        /* allow for a doubled consonant */
        this.word.setLength(this.j);
        this.k = this.j - 1;
        if (this.lookup()) return;
        this.word.unsafeWrite(this.word.charAt(this.j - 1));
      }

      this.word.setLength(this.j + 1);
      this.word.unsafeWrite('e'); /* try removing the -al and adding -e */
      this.k = this.j + 1;
      if (this.lookup()) return;

      this.word.setLength(this.j + 1);
      this.word.append("um"); /* try converting -al to -um */
      /* (e.g., optimal - > optimum ) */
      this.k = this.j + 2;
      if (this.lookup()) return;

      this.word.setLength(this.j + 1);
      this.word.append("al"); /* restore the ending to the way it was */
      this.k = old_k;

      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'i') && (this.word.charAt(this.j) == 'c')) {
        this.word.setLength(this.j - 1); /* try removing -ical */
        this.k = this.j - 2;
        if (this.lookup()) return;

        this.word.setLength(this.j - 1);
        this.word.unsafeWrite('y'); /* try turning -ical to -y (e.g., bibliographical) */
        this.k = this.j - 1;
        if (this.lookup()) return;

        this.word.setLength(this.j - 1);
        this.word.append("ic"); /* the default is to convert -ical to -ic */
        this.k = this.j;
        // nolookup() ... converting ical to ic means removing "al" which we
        // already tried
        // ERROR
        this.lookup();
        return;
      }

      if (this.word.charAt(this.j) == 'i') {
        /* sometimes -ial endings should be removed */
        this.word.setLength(this.j); /* (sometimes it gets turned into -y, but we */
        this.k = this.j - 1; /* aren't dealing with that case for now) */
        if (this.lookup()) return;
        this.word.append("ial");
        this.k = old_k;
        this.lookup();
      }
    }
    return;
  }

  /*
   * this routine deals with -ive endings. It normalizes some of the -ative
   * endings directly, and also maps some -ive endings to -ion.
   */
  iveEndings() {
    let old_k = this.k;

    if (this.endsIn('i', 'v', 'e')) {
      this.word.setLength(this.j + 1); /* try removing -ive entirely */
      this.k = this.j;
      if (this.lookup()) return;

      this.word.unsafeWrite('e'); /* try removing -ive and adding -e */
      this.k = this.j + 1;
      if (this.lookup()) return;
      this.word.setLength(this.j + 1);
      this.word.append("ive");
      if ((this.j > 0) && (this.word.charAt(this.j - 1) == 'a') && (this.word.charAt(this.j) == 't')) {
        this.word.setCharAt(this.j - 1, 'e'); /* try removing -ative and adding -e */
        this.word.setLength(this.j); /* (e.g., determinative -> determine) */
        this.k = this.j - 1;
        if (this.lookup()) return;
        this.word.setLength(this.j - 1); /* try just removing -ative */
        if (this.lookup()) return;

        this.word.append("ative");
        this.k = old_k;
      }

      /* try mapping -ive to -ion (e.g., injunctive/injunction) */
      this.word.setCharAt(this.j + 2, 'o');
      this.word.setCharAt(this.j + 3, 'n');
      if (this.lookup()) return;

      this.word.setCharAt(this.j + 2, 'v'); /* restore the original values */
      this.word.setCharAt(this.j + 3, 'e');
      this.k = old_k;
      // nolookup()
    }
    return;
  }

  matched() {
    /*
     * if (!lookups.contains(word.toString())) { throw new
     * RuntimeException("didn't look up "+word.toString()+" prev="+prevLookup);
     * }
     */
    // lookup();
    return this.matchedEntry != null;
  }


  /** Stem satu kata (huruf kecil a-z). Mengembalikan kata itu sendiri bila tidak berubah. */
  stem(term) {
    const len = term.length;
    this.result = null;
    this.k = len - 1;
    if (this.k <= 1 || this.k >= MaxWordLen - 1) return term;
    let entry = dict_ht.get(term);
    if (entry != null) return entry.root != null ? entry.root : term;
    this.word.reset();
    for (let i = 0; i < len; i++) {
      const ch = term[i];
      if (!this.isAlpha(ch)) return term;
      this.word.unsafeWrite(ch);
    }
    this.matchedEntry = null;
    /*
     * lookups.clear(); lookups.add(word.toString());
     */

    /*
     * This while loop will never be executed more than one time; it is here
     * only to allow the break statement to be used to escape as soon as a word
     * is recognized
     */
    while (true) {
      // YCS: extra lookup()s were inserted so we don't need to
      // do an extra wordInDict() here.
      this.plural();
      if (this.matched()) break;
      this.pastTense();
      if (this.matched()) break;
      this.aspect();
      if (this.matched()) break;
      this.ityEndings();
      if (this.matched()) break;
      this.nessEndings();
      if (this.matched()) break;
      this.ionEndings();
      if (this.matched()) break;
      this.erAndOrEndings();
      if (this.matched()) break;
      this.lyEndings();
      if (this.matched()) break;
      this.alEndings();
      if (this.matched()) break;
      entry = this.wordInDict();
      this.iveEndings();
      if (this.matched()) break;
      this.izeEndings();
      if (this.matched()) break;
      this.mentEndings();
      if (this.matched()) break;
      this.bleEndings();
      if (this.matched()) break;
      this.ismEndings();
      if (this.matched()) break;
      this.icEndings();
      if (this.matched()) break;
      this.ncyEndings();
      if (this.matched()) break;
      this.nceEndings();
      this.matched();
      break;
    }

    /*
     * try for a direct mapping (allows for cases like `Italian'->`Italy' and
     * `Italians'->`Italy')
     */
    entry = this.matchedEntry;
    if (entry != null) {
      this.result = entry.root; // may be null, which means that "word" is the stem
    }

    /*
     * caching off is normally faster if (cache != null && cache.size() <
     * maxCacheSize) { char[] key = new char[len]; System.arraycopy(term, 0,
     * key, 0, len); if (result != null) { cache.put(key, result); } else {
     * cache.put(key, word.toString()); } }
     */

    /*
     * if (entry == null) { if (!word.toString().equals(new String(term,0,len)))
     * { System.out.println("CASE:" + word.toString() + "," + new
     * String(term,0,len));
     *
     * } }
     */

    return this.result != null ? this.result : this.word.toString();
  }
}

  const instance = new KStemmer();
  ATLAS.nlp.kstem = (w) => instance.stem(w);
})();
