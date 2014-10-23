/*! concerto - v0.1.0 | 2014-10-23 | (c) Taehoon Moon 2014, 2014 | https://raw.github.com/panarch/concerto/master/LICENSE */
function Concerto() {}

Concerto.Debug = !0, Concerto.LogLevels = {
    DEBUG: 5,
    INFO: 4,
    WARN: 3,
    ERROR: 2,
    FATAL: 1
}, Concerto.LogLevelNames = {
    5: "DEBUG",
    4: "INFO",
    3: "WARN",
    2: "ERROR",
    1: "FATAL"
}, Concerto.LogLevel = Concerto.LogLevels.DEBUG, Concerto.logMessage = function(level, message) {
    if (level <= Concerto.LogLevel && window.console) {
        var log_message = message;
        log_message = "object" == typeof message ? {
            level: Concerto.LogLevelNames[level],
            message: message
        } : "ConcertoLog: [" + Concerto.LogLevelNames[level] + "] " + log_message, window.console.log(log_message);
    }
}, Concerto.logDebug = function(message) {
    Concerto.logMessage(Concerto.LogLevels.DEBUG, message);
}, Concerto.logInfo = function(message) {
    Concerto.logMessage(Concerto.LogLevels.INFO, message);
}, Concerto.logWarn = function(message) {
    Concerto.logMessage(Concerto.LogLevels.WARN, message);
}, Concerto.logError = function(message) {
    Concerto.logMessage(Concerto.LogLevels.ERROR, message);
}, Concerto.logFatal = function(message, exception) {
    throw Concerto.logMessage(Concerto.LogLevels.FATAL, message), exception ? exception : "ConcertoFatalError";
}, Concerto.Table = {}, Concerto.Table.ACCIDENTAL_DICT = {
    sharp: "#",
    "double-sharp": "##",
    natural: "n",
    flat: "b",
    "double-flat": "bb"
}, Concerto.Table.DEFAULT_CLEF = "treble", Concerto.Table.DEFAULT_TIME_BEATS = 4, 
Concerto.Table.DEFAULT_TIME_BEAT_TYPE = 4, Concerto.Table.DEFAULT_REST_PITCH = "b/4", 
Concerto.Table.FLAT_MAJOR_KEY_SIGNATURES = [ "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb" ], 
Concerto.Table.SHARP_MAJOR_KEY_SIGNATURES = [ "G", "D", "A", "E", "B", "F#", "C#" ], 
Concerto.Table.NOTE_TYPES = [ "1024th", "512th", "256th", "128th", "64th", "32nd", "16th", "eighth", "quarter", "half", "whole", "breve", "long", "maxima" ], 
Concerto.Table.NOTE_VEX_QUARTER_INDEX = 8, Concerto.Table.NOTE_VEX_TYPES = [ "1024", "512", "256", "128", "64", "32", "16", "8", "q", "h", "w", "w", "w", "w" ], 
Concerto.Table.NOTE_TYPE_DICT = {
    "1024th": "64",
    "512th": "64",
    "256th": "64",
    "128th": "128",
    "64th": "64",
    "32nd": "32",
    "16th": "16",
    eighth: "8",
    quarter: "q",
    half: "h",
    whole: "w",
    breve: "w",
    "long": "w",
    maxima: "w"
}, Concerto.Table.NOTE_VEX_TYPE_DICT = {}, Concerto.Table.CLEF_TYPE_DICT = {
    G: "treble",
    F: "bass"
}, Concerto.Table.STAVE_DEFAULT_OPTIONS = {
    space_above_staff_ln: 0
}, Concerto.Parser = {}, Concerto.Parser.getNumPages = function(musicjson) {
    for (var measures = musicjson.part[0].measure, num = 1, i = 0; i < measures.length; i++) {
        var measure = measures[i];
        measure.print && measure.print["@new-page"] && num++;
    }
    return num;
}, Concerto.Parser.getPageSize = function(musicjson) {
    var pageLayout = musicjson.defaults["page-layout"];
    return $("#content").css("width", pageLayout["page-width"]).css("height", pageLayout["page-height"]), 
    $("#content").find("svg").remove(), {
        width: pageLayout["page-width"],
        height: pageLayout["page-height"]
    };
}, Concerto.Parser.getBeams = function(notes) {
    for (var note, beams = [], temps = [], i = 0; i < notes.length; i++) if (note = notes[i], 
    note.beam) {
        var beamText = note.beam[0].text;
        if ("begin" == beamText || "continue" == beamText) temps.push(note.staveNote); else if ("end" == beamText) {
            temps.push(note.staveNote);
            var beam = new Vex.Flow.Beam(temps);
            temps = [], beams.push(beam);
        }
    }
    return beams;
}, Concerto.Parser.drawVoices = function(voices, ctx) {
    if (0 !== voices.length) {
        {
            var i, _voices = [], stave = voices[0][1];
            stave.getNoteEndX() - stave.getNoteStartX() - 10;
        }
        for (i = 0; i < voices.length; i++) _voices.push(voices[i][0]);
        for (i = 0; i < voices.length; i++) {
            var voice = voices[i][0];
            stave = voices[i][1], voice.draw(ctx, stave);
        }
    }
}, Concerto.Parser.parseAndDraw = function(pages, musicjson) {
    var staves, voices, beams, parts = musicjson.part, attributesManager = new Concerto.Parser.AttributesManager(), layoutManager = new Concerto.Parser.LayoutManager(musicjson), measureManager = new Concerto.Parser.MeasureManager(musicjson), numMeasures = parts[0].measure.length, curPageIndex = 0;
    layoutManager.setPageIndex(curPageIndex);
    var p, i, j, k, divisions = 1, ctx = pages[curPageIndex];
    for (i = 0; numMeasures > i; i++) {
        for (measureManager.setMeasureIndex(i), attributesManager.setMeasureIndex(i), staves = [], 
        beams = [], voices = [], p = 0; p < parts.length; p++) {
            measureManager.setPartIndex(p), attributesManager.setPartIndex(p);
            var measure = parts[p].measure[i];
            measure.print && measure.print["@new-page"] && (curPageIndex++, layoutManager.setPageIndex(curPageIndex), 
            ctx = pages[curPageIndex]);
            var firstMeasure = measureManager.getFirstMeasure(), leftMeasure = measureManager.getLeftMeasure(), aboveMeasure = measureManager.getAboveMeasure(), curStaves = layoutManager.getStaves(measure, leftMeasure, aboveMeasure, firstMeasure);
            staves = staves.concat(curStaves);
            var stave = curStaves[0], stave2 = curStaves[1];
            measure.stave = stave, measure.stave2 = stave2, Concerto.Parser.BarlineManager.addBarlineToStave(stave, measure.barline), 
            stave2 && Concerto.Parser.BarlineManager.addBarlineToStave(stave2, measure.barline);
            var note, clef, notes = measure.note, noteManager = new Concerto.Parser.NoteManager(attributesManager), clefExists = !1, isAttributes = !1;
            if (notes.length > 0 && (note = notes[0], isAttributes = "attributes" == note.tag, 
            isAttributes && note.clef && (attributesManager.setClefs(note.clef, p), clefExists = !0)), 
            measure.print || clefExists) for (k = 0; k < curStaves.length; k++) {
                var staff = k + 1;
                clef = attributesManager.getClef(p, staff), void 0 !== clef && curStaves[k].addClef(clef);
            }
            for (isAttributes > 0 && (note.key && (attributesManager.setKeySignature(note.key, p, note.staff), 
            Concerto.Parser.AttributesManager.addKeySignatureToStave(stave, note.key), stave2 && Concerto.Parser.AttributesManager.addKeySignatureToStave(stave2, note.key)), 
            note.time && (attributesManager.setTimeSignature(note.time), Concerto.Parser.AttributesManager.addTimeSignatureToStave(stave, note.time), 
            stave2 && Concerto.Parser.AttributesManager.addTimeSignatureToStave(stave2, note.time)), 
            note.divisions && (attributesManager.setDivisions(note.divisions), divisions = note.divisions)), 
            j = 0; j < notes.length; j++) if (note = notes[j], j > 0 && "attributes" == note.tag) {
                if (note.clef) if (attributesManager.setClefs(note.clef, p), void 0 === note[j + 1]) Concerto.Parser.AttributesManager.addEndClefToStave(curStaves, note.clef); else {
                    var clefNote = Concerto.Parser.AttributesManager.getClefNote(note.clef);
                    noteManager.addClefNote(clefNote, note);
                }
            } else if ("note" == note.tag) {
                var chordNotes = [ note ];
                for (k = j + 1; k < notes.length; k++) {
                    var nextNote = notes[k];
                    if (!nextNote.chord) break;
                    j++, chordNotes.push(nextNote);
                }
                clef = attributesManager.getClef(p, note.staff, Concerto.Table.DEFAULT_CLEF);
                var staveNote;
                note.staff && 2 == note.staff ? (staveNote = Concerto.Parser.NoteManager.getStaveNote(chordNotes, clef, divisions), 
                noteManager.addStaveNote(staveNote, note)) : (staveNote = Concerto.Parser.NoteManager.getStaveNote(chordNotes, clef, divisions), 
                noteManager.addStaveNote(staveNote, note)), note.staveNote = staveNote;
            } else "backup" == note.tag ? noteManager.addBackup(note.duration) : "forward" == note.tag && noteManager.addForward(note.duration);
            var newBeams = Concerto.Parser.getBeams(notes);
            beams = beams.concat(newBeams);
            var newVoices = noteManager.getVoices(curStaves);
            voices = voices.concat(newVoices), void 0 !== ctx && (stave.setContext(ctx).draw(), 
            measure["top-line-y"] = stave.getYForLine(0) + 1, measure["top-y"] = stave.y, measure["bottom-line-y"] = stave.getYForLine(stave.options.num_lines - 1) + 1, 
            measure["bottom-y"] = stave.getBottomY(), stave2 && (stave2.setContext(ctx).draw(), 
            measure["bottom-line-y"] = stave2.getYForLine(stave2.options.num_lines - 1) + 1, 
            measure["bottom-y"] = stave2.getBottomY()));
        }
        if (void 0 !== ctx) {
            for (Concerto.Parser.drawVoices(voices, ctx), j = 0; j < beams.length; j++) beams[j].setContext(ctx).draw();
            if (parts[0].measure[i].print) {
                var staveConnector = new Vex.Flow.StaveConnector(staves[0], staves[staves.length - 1]);
                staveConnector.setContext(ctx), staveConnector.setType(Vex.Flow.StaveConnector.type.BRACE), 
                staveConnector.draw(), staveConnector.setType(Vex.Flow.StaveConnector.type.SINGLE), 
                staveConnector.draw();
            }
        }
    }
    return musicjson;
}, Concerto.Parser.AttributesManager = function() {
    this.time = {
        beats: Concerto.Table.DEFAULT_TIME_BEATS,
        "beat-type": Concerto.Table.DEFAULT_TIME_BEAT_TYPE
    }, this.divisions = 1, this.keyDict = {}, this.clefDict = {}, this.partIndex = 0, 
    this.measureIndex = 0;
}, Concerto.Parser.AttributesManager.prototype.setClef = function(part, staff, clef) {
    void 0 === this.clefDict[part] && (this.clefDict[part] = {}), void 0 === staff ? (staff = 1, 
    this.clefDict[part][staff] = clef) : 1 == staff ? (this.clefDict[part][staff] = clef, 
    void 0 === this.clefDict[part][2] && (this.clefDict[part][2] = clef)) : this.clefDict[part][staff] = clef;
}, Concerto.Parser.AttributesManager.prototype.setClefs = function(rawClefs, part) {
    void 0 === this.clefDict[part] && (this.clefDict[part] = {});
    for (var i = 0; i < rawClefs.length; i++) {
        var rawClef = rawClefs[i], clefSign = rawClef.sign, clef = Concerto.Table.CLEF_TYPE_DICT[clefSign];
        void 0 === clef && (Concerto.logError("Unsupported clef sign: " + clefSign), clef = Concerto.Table.DEFAULT_CLEF);
        var staff;
        staff = void 0 !== rawClef["@number"] ? rawClef["@number"] : 1, this.clefDict[part][staff] = clef;
    }
}, Concerto.Parser.AttributesManager.prototype.getClef = function(part, staff, defaultClef) {
    return void 0 === staff && (staff = 1), void 0 === this.clefDict[part] || void 0 === this.clefDict[part][staff] ? defaultClef : this.clefDict[part][staff];
}, Concerto.Parser.AttributesManager.prototype.setKeySignature = function(key, part, staff) {
    void 0 === staff && (staff = 1), void 0 === this.keyDict[part] && (this.keyDict[part] = {}), 
    this.keyDict[part][staff] = key;
}, Concerto.Parser.AttributesManager.prototype.getKeySignature = function(part, staff) {
    return void 0 === staff && (staff = 1), this.keyDict[part][staff];
}, Concerto.Parser.AttributesManager.prototype.setDivisions = function(divisions) {
    this.divisions = divisions;
}, Concerto.Parser.AttributesManager.prototype.getDivisions = function() {
    return this.divisions;
}, Concerto.Parser.AttributesManager.prototype.setTimeSignature = function(time) {
    this.time = time;
}, Concerto.Parser.AttributesManager.prototype.getTimeSignature = function() {
    return this.time;
}, Concerto.Parser.AttributesManager.prototype.setPartIndex = function(partIndex) {
    this.partIndex = partIndex;
}, Concerto.Parser.AttributesManager.prototype.setMeasureIndex = function(measureIndex) {
    this.measureIndex = measureIndex;
}, Concerto.Parser.AttributesManager.addClefToStave = function(stave, clef) {}, 
Concerto.Parser.AttributesManager.addKeySignatureToStave = function(stave, keyDict) {
    if (void 0 === keyDict.fifths) return void Concerto.logError("key fifths does not exists");
    var keySpec, fifths = keyDict.fifths;
    keySpec = 0 === fifths ? "C" : fifths > 0 ? Concerto.Table.SHARP_MAJOR_KEY_SIGNATURES[fifths - 1] : Concerto.Table.FLAT_MAJOR_KEY_SIGNATURES[-fifths - 1], 
    stave.addKeySignature(keySpec);
}, Concerto.Parser.AttributesManager.addTimeSignatureToStave = function(stave, timeDict) {
    var timeSpec;
    timeDict["@symbol"] ? "common" == timeDict["@symbol"] ? timeSpec = "C" : "cut" == timeDict["@symbol"] ? timeSpec = "C|" : (Concerto.logWarn("Unsupported time symbol"), 
    timeSpec = "C") : timeSpec = timeDict.beats + "/" + timeDict["beat-type"], stave.addTimeSignature(timeSpec);
}, Concerto.Parser.AttributesManager.addEndClefToStave = function(staves, rawClefs) {
    for (var i = 0; i < rawClefs.length; i++) {
        var rawClef = rawClefs[i], clefSign = rawClef.sign, clef = Concerto.Table.CLEF_TYPE_DICT[clefSign];
        clef += "_small", 1 == rawClef["@number"] ? staves[0].addEndClef(clef) : staves[1].addEndClef(clef);
    }
}, Concerto.Parser.AttributesManager.getClefNote = function(rawClefs) {
    var clefSign = rawClefs[0].sign, clef = Concerto.Table.CLEF_TYPE_DICT[clefSign];
    clef += "_small";
    var clefNote = new Vex.Flow.ClefNote(clef);
    return clefNote;
}, Concerto.Parser.LayoutManager = function(musicjson) {
    this.page = 1, this.parts = musicjson.part, this.pageLayout = musicjson.defaults["page-layout"], 
    this.leftMargin = 0;
}, Concerto.Parser.LayoutManager.prototype.getPageMargins = function() {
    if (Array.isArray(this.pageLayout["page-margins"]) === !1) return this.pageLayout["page-margins"];
    if (1 == this.pageLayout["page-margins"].length) return this.pageLayout["page-margins"][0];
    for (var pageType = this.page % 2 == 1 ? "odd" : "even", i = 0; i < this.pageLayout["page-margins"].length; i++) if (this.pageLayout["page-margins"][i]["@type"] == pageType) return this.pageLayout["page-margins"][i];
    return Concerto.logError("page-margins required"), {};
}, Concerto.Parser.LayoutManager.prototype.setPageIndex = function(pageIndex) {
    this.page = pageIndex + 1;
}, Concerto.Parser.LayoutManager.prototype.getStavePositions = function(measure, leftMeasure, aboveMeasure, firstMeasure) {
    var position, print, positions = [], pageMargins = this.getPageMargins();
    if (leftMeasure) measure.y = leftMeasure.y, measure.x = leftMeasure.x + leftMeasure.width, 
    position = {
        x: measure.x,
        y: measure.y
    }, positions.push(position); else {
        if (print = measure.print, measure.x = pageMargins["left-margin"], print["system-layout"]) {
            var systemLayout = print["system-layout"];
            if (this.leftMargin = systemLayout["system-margins"] && systemLayout["system-margins"]["left-margin"] ? systemLayout["system-margins"]["left-margin"] : 0, 
            void 0 !== systemLayout["top-system-distance"]) {
                var topMargin = pageMargins["top-margin"];
                measure.y = topMargin + systemLayout["top-system-distance"];
            } else void 0 !== systemLayout["system-distance"] ? measure.y = aboveMeasure["bottom-line-y"] + systemLayout["system-distance"] : Concerto.logError("Unhandled layout state");
        } else print["staff-layout"].length > 0 ? measure.y = aboveMeasure["bottom-line-y"] + print["staff-layout"][0]["staff-distance"] : Concerto.logError("Lack of print tag");
        measure.x += this.leftMargin, position = {
            x: measure.x,
            y: measure.y
        }, positions.push(position);
    }
    if (print = firstMeasure.print, !print["staff-layout"]) return positions;
    var staffDistance;
    if (print["staff-layout"].length > 1) staffDistance = print["staff-layout"][1]["staff-distance"]; else {
        if (!(print["system-layout"] && print["staff-layout"].length > 0)) return Concerto.logError("Wrong staff-layout."), 
        positions;
        staffDistance = print["staff-layout"][0]["staff-distance"];
    }
    var y = measure.y + 40 + staffDistance;
    return position = {
        x: measure.x,
        y: y
    }, measure.y2 = y, positions.push(position), positions;
}, Concerto.Parser.LayoutManager.prototype.getStaves = function(measure, leftMeasure, aboveMeasure, firstMeasure) {
    for (var positions = this.getStavePositions(measure, leftMeasure, aboveMeasure, firstMeasure), staves = [], i = 0; i < positions.length; i++) {
        var position = positions[i], stave = new Vex.Flow.Stave(position.x, position.y, measure.width, Concerto.Table.STAVE_DEFAULT_OPTIONS);
        staves.push(stave);
    }
    return staves;
}, Concerto.Parser.NoteManager = function(attributesManager) {
    this.duration = 0, this.attributesManager = attributesManager, this.notes = [], 
    this.notesList = [ this.notes ], this.staffList = [], this.staffUndecided = !0;
}, Concerto.Parser.NoteManager.prototype.addStaveNote = function(staveNote, note) {
    var duration = note.duration, staff = (note.voice, note.staff);
    void 0 === staff && (staff = 1), this.staffUndecided && (this.staffList.push(staff), 
    this.staffUndecided = !1), this.duration += duration, this.notes.push(staveNote);
}, Concerto.Parser.NoteManager.prototype.addClefNote = function(clefNote) {
    this.notes.push(clefNote);
}, Concerto.Parser.NoteManager.prototype.addBackup = function(duration) {
    var divisions = this.attributesManager.getDivisions();
    if (this.staffUndecided = !0, this.duration -= duration, this.notes = [], this.duration > 0) {
        var noteType = Concerto.Parser.NoteManager.getStaveNoteTypeFromDuration(this.duration, divisions), ghostNote = new Vex.Flow.GhostNote({
            duration: noteType
        });
        this.notes.push(ghostNote);
    }
    this.notesList.push(this.notes);
}, Concerto.Parser.NoteManager.prototype.addForward = function(duration) {
    var divisions = this.attributesManager.getDivisions();
    this.duration += duration;
    var noteType = Concerto.Parser.NoteManager.getStaveNoteTypeFromDuration(duration, divisions), ghostNote = new Vex.Flow.GhostNote({
        duration: noteType
    });
    this.notes.push(ghostNote);
}, Concerto.Parser.NoteManager.prototype.fillVoice = function(time, notes) {
    for (var divisions = this.attributesManager.getDivisions(), maxDuration = 4 * divisions / time["beat-type"] * time.beats, duration = 0, i = 0; i < notes.length; i++) {
        var staveNote = notes[i];
        duration += Concerto.Parser.NoteManager.getDurationFromStaveNote(staveNote, divisions);
    }
    if (duration = maxDuration - duration, 0 > duration) return void Concerto.logWarn("Sum of duration exceeds time sig");
    if (0 !== duration) {
        var noteType = Concerto.Parser.NoteManager.getStaveNoteTypeFromDuration(duration, divisions), ghostNote = new Vex.Flow.GhostNote({
            duration: noteType
        });
        notes.push(ghostNote);
    }
}, Concerto.Parser.NoteManager.prototype.getVoices = function(staves) {
    function _format(staffVoices, stave) {
        var options = {};
        options.align_rests = staffVoices.length > 1 ? !0 : !1, formatter = new Vex.Flow.Formatter(), 
        formatter.joinVoices(staffVoices), formatter.formatToStave(staffVoices, stave, options);
    }
    for (var stave, formatter, voices = [], preStaff = this.staffList[0], staffVoices = [], time = this.attributesManager.getTimeSignature(), i = 0; i < this.notesList.length; i++) {
        var staff = this.staffList[i];
        stave = staves[staff - 1];
        var notes = this.notesList[i];
        if (0 !== notes.length) {
            var voice = new Vex.Flow.Voice({
                num_beats: time.beats,
                beat_value: time["beat-type"],
                resolution: Vex.Flow.RESOLUTION
            });
            voice.setMode(Vex.Flow.Voice.Mode.SOFT), this.fillVoice(time, notes), voice = voice.addTickables(notes), 
            voices.push([ voice, stave ]), preStaff != staff ? (_format(staffVoices, stave), 
            staffVoices = [ voice ], preStaff = staff) : staffVoices.push(voice);
        }
    }
    return staffVoices.length > 0 && _format(staffVoices, stave), voices;
}, Concerto.Parser.NoteManager.getDurationFromStaveNote = function(staveNote, divisions) {
    var numDots, noteType = staveNote.getDuration();
    numDots = staveNote["-concerto-num-dots"] ? staveNote["-concerto-num-dots"] : 0;
    var index = Concerto.Table.NOTE_VEX_TYPES.indexOf(noteType), offset = index - Concerto.Table.NOTE_VEX_QUARTER_INDEX, duration = Math.pow(2, offset) * divisions;
    return duration = 2 * duration - duration * Math.pow(2, -numDots);
}, Concerto.Parser.NoteManager.getStaveNoteTypeFromDuration = function(duration, divisions, withDots) {
    void 0 === withDots && (withDots = !1);
    var count, num, i = Concerto.Table.NOTE_VEX_QUARTER_INDEX;
    for (count = 0; 20 > count && (num = Math.floor(duration / divisions), 1 != num); count++) num > 1 ? (divisions *= 2, 
    i++) : (divisions /= 2, i--);
    20 == count && Concerto.logError("No proper StaveNote type");
    var noteType = Concerto.Table.NOTE_VEX_TYPES[i];
    if (withDots) for (count = 0; 5 > count && (duration -= Math.floor(duration / divisions), 
    divisions /= 2, num = Math.floor(duration / divisions), 1 == num); count++) noteType += "d";
    return noteType;
}, Concerto.Parser.NoteManager.addTechnicalToStaveNote = function(staveNote, note) {
    var notationsDict = note.notations;
    if (void 0 !== notationsDict.technical) for (var i = 0; i < notationsDict.technical.length; i++) {
        var technicalSymbol, item = notationsDict.technical[i];
        if ("down-bow" == item.tag ? technicalSymbol = "am" : "up-bow" == item.tag ? technicalSymbol = "a|" : "snap-pizzicato" == item.tag ? technicalSymbol = "ao" : Concerto.logWarn("Unhandled technical symbol."), 
        void 0 !== technicalSymbol) {
            var technical = new Vex.Flow.Articulation(technicalSymbol);
            technical.setPosition("up" == note.stem ? Vex.Flow.Modifier.Position.ABOVE : Vex.Flow.Modifier.Position.BELOW), 
            staveNote.addArticulation(0, technical);
        }
    }
}, Concerto.Parser.NoteManager.addArticulationToStaveNote = function(staveNote, note) {
    var notationsDict = note.notations;
    if (void 0 !== notationsDict.articulations) for (var i = 0; i < notationsDict.articulations.length; i++) {
        var articulationSymbol, item = notationsDict.articulations[i];
        if ("accent" == item.tag ? articulationSymbol = "a>" : "staccato" == item.tag ? articulationSymbol = "a." : "tenuto" == item.tag ? articulationSymbol = "a-" : "strong-accent" == item.tag ? articulationSymbol = "a^" : Concerto.logWarn("Unhandled articulations symbol."), 
        void 0 !== articulationSymbol) {
            var articulation = new Vex.Flow.Articulation(articulationSymbol);
            articulation.setPosition("up" == note.stem ? Vex.Flow.Modifier.Position.ABOVE : Vex.Flow.Modifier.Position.BELOW), 
            staveNote.addArticulation(0, articulation);
        }
    }
}, Concerto.Parser.NoteManager.getStaveNote = function(notes, clef, divisions) {
    var duration, i, keys = [], accidentals = [], baseNote = notes[0];
    if (duration = void 0 !== baseNote.type ? Concerto.Table.NOTE_TYPE_DICT[baseNote.type] : Concerto.Parser.NoteManager.getStaveNoteTypeFromDuration(baseNote.duration, divisions), 
    1 == notes.length && baseNote.rest) duration += "r", keys.push(Concerto.Table.DEFAULT_REST_PITCH), 
    clef = void 0; else for (i = 0; i < notes.length; i++) {
        var note = notes[i], key = note.pitch.step.toLowerCase();
        if (note.accidental) {
            var accidental = Concerto.Table.ACCIDENTAL_DICT[note.accidental];
            key += accidental, accidentals.push(accidental);
        } else accidentals.push(!1);
        key += "/" + note.pitch.octave, keys.push(key);
    }
    if (baseNote.dot) for (i = 0; i < baseNote.dot; i++) duration += "d";
    var staveNote = new Vex.Flow.StaveNote({
        keys: keys,
        duration: duration,
        clef: clef
    });
    for (i = 0; i < accidentals.length; i++) accidentals[i] && staveNote.addAccidental(i, new Vex.Flow.Accidental(accidentals[i]));
    if (staveNote["-concerto-num-dots"] = baseNote.dot, baseNote.dot) for (i = 0; i < baseNote.dot; i++) staveNote.addDotToAll();
    if ("up" == baseNote.stem && staveNote.setStemDirection(Vex.Flow.StaveNote.STEM_DOWN), 
    void 0 !== baseNote.notations) {
        var notationsDict = baseNote.notations;
        if (void 0 !== notationsDict.fermata) {
            var fermataType = notationsDict.fermata["@type"];
            "upright" == fermataType ? staveNote.addArticulation(0, new Vex.Flow.Articulation("a@a").setPosition(Vex.Flow.Modifier.Position.ABOVE)) : "inverted" == fermataType ? staveNote.addArticulation(0, new Vex.Flow.Articulation("a@u").setPosition(Vex.Flow.Modifier.Position.BELOW)) : Concerto.logError("Unhandled fermata type.");
        }
        Concerto.Parser.NoteManager.addTechnicalToStaveNote(staveNote, baseNote), Concerto.Parser.NoteManager.addArticulationToStaveNote(staveNote, baseNote);
    }
    return staveNote;
}, Concerto.Parser.MeasureManager = function(musicjson) {
    this.parts = musicjson.part, this.pageLayout = musicjson.defaults["page-layout"], 
    this.firstMeasures = new Array(this.parts.length), this.partIndex = 0, this.measureIndex = 0;
}, Concerto.Parser.MeasureManager.prototype.setPartIndex = function(partIndex) {
    this.partIndex = partIndex;
    var measure = this.parts[this.partIndex].measure[this.measureIndex];
    measure.print && (this.firstMeasures[this.partIndex] = measure);
}, Concerto.Parser.MeasureManager.prototype.setMeasureIndex = function(measureIndex) {
    this.measureIndex = measureIndex;
}, Concerto.Parser.MeasureManager.prototype.getFirstMeasure = function(partIndex) {
    return void 0 === partIndex && (partIndex = this.partIndex), this.firstMeasures[partIndex];
}, Concerto.Parser.MeasureManager.prototype.getLeftMeasure = function() {
    var measure = this.parts[this.partIndex].measure[this.measureIndex];
    return measure.print && (measure.print["@new-page"] || measure.print["@new-system"]) ? void 0 : this.parts[this.partIndex].measure[this.measureIndex - 1];
}, Concerto.Parser.MeasureManager.prototype.getAboveMeasure = function() {
    if (0 === this.partIndex) {
        var firstMeasure = (this.measureIndex - 1, this.getFirstMeasure(this.partIndex));
        return void 0 !== firstMeasure.print["system-layout"]["top-system-distance"] ? void 0 : this.parts[this.parts.length - 1].measure[this.measureIndex - 1];
    }
    return this.parts[this.partIndex - 1].measure[this.measureIndex];
}, Concerto.Parser.BarlineManager = {}, Concerto.Parser.BarlineManager.getBarlineType = function(barline, isLeft) {
    return barline.repeat ? isLeft ? Vex.Flow.Barline.type.REPEAT_BEGIN : Vex.Flow.Barline.type.REPEAT_END : "light-light" == barline["bar-style"] ? Vex.Flow.Barline.type.DOUBLE : "light-heavy" == barline["bar-style"] ? Vex.Flow.Barline.type.END : (Concerto.logWarn("Unhandled barline style : " + barline["bar-style"]), 
    Vex.Flow.Barline.type.SINGLE);
}, Concerto.Parser.BarlineManager.addBarlineToStave = function(stave, barlineDict) {
    var barlineType;
    if (barlineDict["left-barline"]) {
        var leftBarline = barlineDict["left-barline"];
        barlineType = Concerto.Parser.BarlineManager.getBarlineType(leftBarline, !0), stave.setBegBarType(barlineType);
    }
    if (barlineDict["right-barline"]) {
        var rightBarline = barlineDict["right-barline"];
        barlineType = Concerto.Parser.BarlineManager.getBarlineType(rightBarline, !1), stave.setEndBarType(barlineType);
    }
}, Concerto.Renderer = function($container, musicjson, options) {
    this.backends = Vex.Flow.Renderer.Backends.RAPHAEL, options && options.backends && (this.backends = options.backends), 
    this.$container = $container, this.numPages = Concerto.Parser.getNumPages(musicjson), 
    this.pages = [], this.doms = [], this.pageSize = Concerto.Parser.getPageSize(musicjson);
    for (var i = 0; i < this.numPages; i++) this.addPage();
    this.musicjson = musicjson;
}, Concerto.Renderer.prototype.addPage = function() {
    var $div = $("<div>");
    $div.css("width", this.pageSize.width).css("height", this.pageSize.height), $div.addClass("concerto-page"), 
    this.$container.append($div);
    var vexflowRenderer = new Vex.Flow.Renderer($div[0], this.backends), ctx = vexflowRenderer.getContext();
    this.pages.push(ctx), this.doms.push($div);
}, Concerto.Renderer.prototype.draw = function(page) {
    var numPages = Concerto.Parser.getNumPages(this.musicjson);
    numPages !== this.numPages && (numPages > this.numPages ? this.addPage() : this.$container.find(".concerto-page:last-child").remove(), 
    this.numPages = numPages);
    var pages;
    if (void 0 === page) pages = this.pages; else for (var i = 0; i < pages.length; i++) pages.push(page === i ? pages[i] : void 0);
    Concerto.Parser.parseAndDraw(pages, this.musicjson);
}, Concerto.Renderer.prototype.clear = function(page) {
    var all = !1;
    void 0 === page && (all = !0);
    for (var i = 0; i < this.doms.length; i++) if (all || page === i) {
        var $dom = this.doms[i], $svg = $dom.find("svg");
        $svg.empty(), $svg.attr("width", this.pageSize.width).attr("height", this.pageSize.height);
    }
}, Concerto.Renderer.prototype.update = function(page) {
    this.clear(page), this.draw(page);
}, Concerto.Converter = {}, Concerto.Converter.getIdentification = function($xml) {
    var $identification = $xml.find("identification"), $encoding = $identification.find("encoding"), identification = {
        encoding: {
            software: $encoding.find("software").text(),
            "encoding-date": $encoding.find("encoding-date").text()
        }
    };
    return identification;
}, Concerto.Converter.getDefaults = function($xml) {
    var $defaults = $xml.find("defaults"), $scaling = $defaults.find("scaling"), scaling = {
        millimeters: parseFloat($scaling.find("millimeters").text()),
        tenths: parseFloat($scaling.find("tenths").text())
    }, $pageLayout = $defaults.find("page-layout"), pageLayout = {
        "page-height": parseFloat($pageLayout.find("page-height").text()),
        "page-width": parseFloat($pageLayout.find("page-width").text()),
        "page-margins": []
    }, $pageMargins = $defaults.find("page-margins");
    $pageMargins.each(function() {
        var pageMargin = {};
        pageMargin["@type"] = $(this).attr("type") ? $(this).attr("type") : "both", pageMargin["left-margin"] = parseFloat($(this).find("left-margin").text()), 
        pageMargin["right-margin"] = parseFloat($(this).find("right-margin").text()), pageMargin["top-margin"] = parseFloat($(this).find("top-margin").text()), 
        pageMargin["bottom-margin"] = parseFloat($(this).find("bottom-margin").text()), 
        pageLayout["page-margins"].push(pageMargin);
    });
    var defaults = {
        scaling: scaling,
        "page-layout": pageLayout
    };
    return defaults;
}, Concerto.Converter.getPartList = function($xml) {
    var partList = [];
    return $xml.find("part-list").children().each(function() {
        if ("part-group" == $(this).prop("tagName")) {
            var partGroup = {
                tag: "part-group"
            };
            partGroup["@type"] = $(this).attr("type"), partGroup["@number"] = parseInt($(this).attr("number")), 
            partGroup["group-symbol"] = $(this).find("group-symbol").text(), partList.push(partGroup);
        } else if ("score-part" == $(this).prop("tagName")) {
            var scorePart = {
                tag: "score-part"
            };
            scorePart["@id"] = $(this).attr("id"), scorePart["part-name"] = $(this).find("part-name").text();
            var $scoreInstrument = $(this).find("score-instrument");
            scorePart["score-instrument"] = {
                "@id": $scoreInstrument.attr("id"),
                "instrument-name": $scoreInstrument.find("instrument-name").text()
            };
            var $midiInstrument = $(this).find("midi-instrument");
            scorePart["midi-instrument"] = {
                "@id": $midiInstrument.attr("id"),
                "midi-channel": parseInt($midiInstrument.find("midi-channel").text()),
                "midi-program": parseInt($midiInstrument.find("midi-program").text())
            }, partList.push(scorePart);
        } else Concerto.logError("Unsupported part-list children tags");
    }), partList;
}, Concerto.Converter.getPrintTag = function($print) {
    var print = {};
    if ("yes" == $print.attr("new-page") ? print["@new-page"] = !0 : "yes" == $print.attr("new-system") && (print["@new-system"] = !0), 
    $print.find("system-layout").length > 0) {
        var $systemLayout = $print.find("system-layout"), $systemMargins = $systemLayout.find("system-margins"), systemLayout = {
            "system-margins": {
                "left-margin": parseFloat($systemMargins.find("left-margin").text()),
                "right-margin": parseFloat($systemMargins.find("right-margin").text())
            }
        };
        $systemLayout.find("top-system-distance").length > 0 ? systemLayout["top-system-distance"] = parseFloat($systemLayout.find("top-system-distance").text()) : $systemLayout.find("system-distance").length > 0 && (systemLayout["system-distance"] = parseFloat($systemLayout.find("system-distance").text())), 
        print["system-layout"] = systemLayout;
    }
    return $print.find("staff-layout").length > 0 && (print["staff-layout"] = [], $print.find("staff-layout").each(function() {
        var staffLayout = {
            "@number": parseInt($(this).attr("number")),
            "staff-distance": parseFloat($(this).find("staff-distance").text())
        };
        print["staff-layout"].push(staffLayout);
    })), print;
}, Concerto.Converter.getAttributesTag = function($attributes) {
    var attributes = {
        tag: "attributes"
    }, $divisions = $attributes.find("divisions");
    $divisions.length > 0 && (attributes.divisions = parseInt($divisions.text()));
    var $staves = $attributes.find("staves");
    $staves.length > 0 && (attributes.staves = parseInt($staves.text()));
    var $clef = $attributes.find("clef");
    if ($clef.length > 0) {
        var clefs = [];
        $clef.each(function() {
            var clef = {
                sign: $(this).find("sign").text(),
                line: parseInt($(this).find("line").text())
            };
            $(this).attr("number") && (clef["@number"] = parseInt($(this).attr("number"))), 
            clefs.push(clef);
        }), clefs.length > 0 && (attributes.clef = clefs);
    }
    var $time = $attributes.find("time");
    $time.length > 0 && (attributes.time = {
        beats: parseInt($time.find("beats").text()),
        "beat-type": parseInt($time.find("beat-type").text())
    }, $time.attr("symbol") && (attributes.time["@symbol"] = $time.attr("symbol")));
    var $key = $attributes.find("key");
    return $key.length > 0 && (attributes.key = {
        fifths: parseInt($key.find("fifths").text())
    }, $key.find("mode").length > 0 && (attributes.mode = $key.find("mode").text())), 
    attributes;
}, Concerto.Converter.getNoteTag = function($note) {
    var note = {
        tag: "note"
    };
    note.duration = parseInt($note.find("duration").text()), $note.find("type").length > 0 && (note.type = $note.find("type").text());
    var $accidental = $note.find("accidental");
    if ($accidental.length > 0 && (note.accidental = $accidental.text()), $note.find("rest").length > 0) note.rest = !0; else {
        var $stem = $note.find("stem");
        $stem.length > 0 && (note.stem = "down" == $stem.text() ? "up" : "down"), $note.find("chord").length > 0 && (note.chord = !0);
        var $beam = $note.find("beam");
        0 !== $beam.length && (note.beam = [], $beam.each(function() {
            var beam = {};
            beam["@number"] = $(this).attr("number"), beam.text = $(this).text(), note.beam.push(beam);
        }));
    }
    if ($note.find("pitch").length > 0) {
        var $pitch = $note.find("pitch");
        note.pitch = {
            step: $pitch.find("step").text(),
            octave: parseInt($pitch.find("octave").text())
        }, $pitch.find("alter").length > 0 && (note.pitch.alter = parseInt($pitch.find("alter").text()));
    }
    var $dot = $note.find("dot");
    $dot.length > 0 && (note.dot = $dot.length);
    var $voice = $note.find("voice");
    $voice.length > 0 && (note.voice = parseInt($voice.text()));
    var $staff = $note.find("staff");
    $staff.length > 0 && (note.staff = parseInt($staff.text()));
    var $notations = $note.find("notations");
    if ($notations.length > 0) {
        note.notations = {};
        var $fermata = $notations.find("fermata");
        if ($fermata.length > 0) {
            var fermata = {};
            fermata["@type"] = $fermata.attr("type") ? $fermata.attr("type") : "upright", note.notations.fermata = fermata;
        }
        var $technical = $notations.find("technical");
        if ($technical.length > 0) {
            var technical = [];
            $technical.children().each(function() {
                technical.push({
                    tag: $(this).prop("tagName")
                });
            }), note.notations.technical = technical;
        }
        var $articulations = $notations.find("articulations");
        if ($articulations.length > 0) {
            var articulations = [];
            $articulations.children().each(function() {
                articulations.push({
                    tag: $(this).prop("tagName")
                });
            }), note.notations.articulations = articulations;
        }
    }
    return note;
}, Concerto.Converter.getForwardAndBackupTag = function($elem) {
    var elem = {
        tag: $elem.prop("tagName"),
        duration: parseInt($elem.find("duration").text())
    };
    return elem;
}, Concerto.Converter.getBarlineTag = function($barline) {
    var barline = {
        tag: $barline.prop("tagName"),
        "bar-style": $barline.find("bar-style").text()
    };
    $barline.find("repeat").length > 0 && (barline.repeat = {
        "@direction": $barline.find("repeat").attr("direction")
    });
    var barlineLocation = $barline.attr("location");
    return "left" == barlineLocation ? barline["@location"] = "left" : "middle" == barlineLocation ? Concerto.logWarn("Unhandled barline @location - middle") : barline["@location"] = "right", 
    barline;
}, Concerto.Converter.getPart = function($xml) {
    var parts = [], $parts = $xml.find("part");
    return $parts.each(function() {
        var part = {
            "@id": $(this).attr("id"),
            measure: []
        };
        $(this).find("measure").each(function() {
            var measure = {
                "@number": parseInt($(this).attr("number")),
                width: parseFloat($(this).attr("width")),
                note: [],
                barline: {}
            };
            $(this).children().each(function() {
                var tagName = $(this).prop("tagName");
                if ("print" == tagName) measure.print = Concerto.Converter.getPrintTag($(this)); else if ("attributes" == tagName) measure.note.push(Concerto.Converter.getAttributesTag($(this))); else if ("note" == tagName) measure.note.push(Concerto.Converter.getNoteTag($(this))); else if ("backup" == tagName || "forward" == tagName) measure.note.push(Concerto.Converter.getForwardAndBackupTag($(this))); else if ("barline" == tagName) {
                    var barline = Concerto.Converter.getBarlineTag($(this));
                    "left" == barline["@location"] ? measure.barline["left-barline"] = barline : measure.barline["right-barline"] = barline;
                } else Concerto.logError("Unsupported note tagname : " + tagName);
            }), part.measure.push(measure);
        }), parts.push(part);
    }), parts;
}, Concerto.Converter.toJSON = function(musicxml) {
    var musicjson = {}, $xml = $(musicxml);
    return musicjson.identification = Concerto.Converter.getIdentification($xml), musicjson.defaults = Concerto.Converter.getDefaults($xml), 
    musicjson["part-list"] = Concerto.Converter.getPartList($xml), musicjson.part = Concerto.Converter.getPart($xml), 
    musicjson;
}, Concerto.Converter.toXML = function() {
    var musicxml = "";
    return musicxml;
};