//L'initialisation des constantes
const corps = document.body;
var onNotePage;

const targetNode = document.body;
const config = {
    childList: true,
    subtree: true
};

//Les fonctions 
function getNotesFromHTML(noteElement) {
    var noteValue;
    var noteSur = 20;
    var noteCoef = 1;
    var noteNonSignificative = false;

    var noteText = String(noteElement.innerText)

    if (noteText[0] === ' ') noteNonSignificative = true

    var noteSplit = noteText.split(' ').filter((f) => f !== '')

    if (noteSplit.length < 1) return;

    var noteSplitNoteText = noteSplit[0].replace(',', '.')
    noteValue = parseFloat(noteSplitNoteText)

    for (var nSEI /* note Split Element Index */ in noteSplit) {

        if (nSEI === 1) continue;

        var nSE /* note Split Element */ = noteSplit[nSEI]
        if (nSE.startsWith('/')) {
            noteSur = parseFloat(nSE.replace('/', '').replace(',', '.'))
        }
        if (nSE.startsWith('(')) {
            noteCoef = parseFloat(nSE.replace('(', '').replace(')', '').replace(',', ''))
        }
    }

    return {
        noteValue,
        noteSur,
        noteCoef, 
        noteNonSignificative
    }
}

class Note {
    constructor(valeur, noteSur, coef, nonSignificatif) {
        this.valeur = valeur
        this.noteSur = noteSur
        this.coef = coef
        this.nonSignificatif = nonSignificatif
    }
    get getNoteSur20() {
        return ((this.getNote * 20) / this.getNoteSur).toFixed(2)
    }
    get getNote() {
        return this.valeur
    }
    get getNoteSur() {
        return this.noteSur
    }
    get getCoef() {
        return this.coef
    }
    get isNotSignificatif() {
        return this.nonSignificatif
    }
}

class Moyenne {
    constructor(tab = []) {
        this.tab = tab
    }
    get getTab() {
        return this.tab
    }

    get getNombreNotes() {
        return this.getTab.length
    }
    get getSommeNote() {
        var somme = 0
        for (let noteIndex in this.getTab) {
            if (this.getTab[noteIndex].isNotSignificatif) continue;

            somme += parseFloat(this.getTab[noteIndex].getNoteSur20) * parseFloat(this.getTab[noteIndex].getCoef)
        }
        return somme
    }
    get getSommeCoef() {
        var somme = 0
        for (let noteIndex in this.getTab) {
            if (this.getTab[noteIndex].isNotSignificatif) continue;
            somme += this.getTab[noteIndex].getCoef
        }
        return somme
    }

    get getMoyenne() {
        return (this.getSommeNote / this.getSommeCoef).toFixed(2)
    }
}


//Les Events
window.onload = function (event) {
    onNotePage = false
    let cible = event.target.URL
    if (cible === undefined) return;
    let cibleTab = cible.split('/')
    if (cibleTab[cibleTab.length - 1] === "Notes") {
        onNotePage = true
    }
}

const callback = function (modifList, observer) {
    var HTMLNotesTab = document.querySelector("#encart-notes > table")
    for (let modif of modifList) {
        if (!(modif.type === 'childList')) continue;

        if (typeof (HTMLNotesTab) === 'undefined' || HTMLNotesTab === null || !onNotePage) continue;
        onNotePage = false

        //Modifier la Page HTML pour ajouter colonne 
        const HTMLTabHead = document.querySelector("#encart-notes > table > thead > tr")
        const HTMLTabHeadNote = document.querySelector("#encart-notes > table > thead > tr > th.notes")
        const HTMLTabHeadMoy = document.createElement("th")
        HTMLTabHeadMoy.innerHTML = `Moyenne`
        HTMLTabHeadMoy.className = "moy"
        HTMLTabHeadMoy.style = "width: 10%;"
        HTMLTabHead.insertBefore(HTMLTabHeadMoy, HTMLTabHeadNote)
        var moyenneTab = []

        const HTMLTabBody = document.querySelector("#encart-notes > table > tbody")
        for (var HTMLTabRow of HTMLTabBody.childNodes) {
            if (HTMLTabRow.tagName == undefined) continue;

            var HTMLTabElementNote = HTMLTabRow.getElementsByClassName('notes')[0]
            var HTMLTENTab /* HTML Tab Element Note  */ = HTMLTabElementNote.getElementsByClassName('valeur')
            var HTMLTabElementNomMatiere = HTMLTabRow.getElementsByClassName('nommatiere')[0].innerText

            if (HTMLTabElementNomMatiere === "VIE DE CLASSE") {
                var toutesMoyenne = new Moyenne(moyenneTab)


                var HTMLTabElementNew = document.createElement('td')
                HTMLTabElementNew.innerHTML = `<td class="moy">${toutesMoyenne.getMoyenne}</th>`
                HTMLTabRow.insertBefore(HTMLTabElementNew, HTMLTabElementNote)
                continue;
            }

            if (HTMLTabRow.className.startsWith('master')) {
                var HTMLTabSecondary = HTMLTabBody.getElementsByClassName('secondary')
                var masterTab = []
                for (var HTMLTabSecondaryElement of HTMLTabSecondary) {
                    if (typeof (HTMLTabSecondaryElement) != "object") continue;
                    if(HTMLTabSecondaryElement.getElementsByClassName('valeur').length < 1) continue;
                    var secondaryTab = []
                    for(var noteElement of HTMLTabSecondaryElement.getElementsByClassName('valeur')){
                        var retoured = getNotesFromHTML(noteElement)
                        secondaryTab.push(new Note(retoured.noteValue, retoured.noteSur, retoured.noteCoef, retoured.noteNonSignificative))

                    }
                    var secondaryMoyenne = new Moyenne(secondaryTab)
                    masterTab.push(new Note(parseFloat(secondaryMoyenne.getMoyenne), 20, 1, false ))

                }
                var masterMoyenne = new Moyenne(masterTab)


                if (masterMoyenne.getMoyenne != "NaN") moyenneTab.push(new Note(masterMoyenne.getMoyenne, 20, 1, false))
                var HTMLTabElementNew = document.createElement('td')
                HTMLTabElementNew.innerHTML = `<td class="moy">${masterMoyenne.getMoyenne}</th>`
                HTMLTabRow.insertBefore(HTMLTabElementNew, HTMLTabElementNote)
                
                continue;
            }



            var notesTab = []
            for (var noteElement of HTMLTENTab) {
                var retoured = getNotesFromHTML(noteElement)
                
                notesTab.push(new Note(retoured.noteValue, retoured.noteSur, retoured.noteCoef, retoured.noteNonSignificative))
            }

            var matiereMoyenne = new Moyenne(notesTab)
            if (matiereMoyenne.getMoyenne != "NaN" && !HTMLTabRow.className.startsWith('secondary')) moyenneTab.push(new Note(matiereMoyenne.getMoyenne, 20, 1, false))

            var HTMLTabElementNew = document.createElement('td')
            HTMLTabElementNew.innerHTML = `<td class="moy">${matiereMoyenne.getMoyenne}</th>`
            HTMLTabRow.insertBefore(HTMLTabElementNew, HTMLTabElementNote)
        }



    }
}

const observer = new MutationObserver(callback)
observer.observe(targetNode, config)
