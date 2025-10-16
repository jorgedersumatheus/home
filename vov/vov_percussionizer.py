#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VOV Percussionizer — Arranjador Rítmico Livre
Autor: Jorge LA Matheus & AxéBit (Inteligência Vital)

Recursos:
- Estilos: samba, batucada_baiana, jazz_swing, blues_shuffle, mantra_tala
- BPM: auto (librosa) ou manual
- Parâmetros: swing, humanização, dry/wet, ganho
- Export: mix final e stems (original/percussão)
"""

import os, sys, math, random, argparse
from pydub import AudioSegment
from pydub.generators import Sine, WhiteNoise, Square

# ---- BPM Auto (opcional) ----------------------------------------------------
def detect_bpm_librosa(path):
    try:
        import librosa
        y, sr = librosa.load(path, mono=True)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        return float(tempo)
    except Exception:
        return None

# ---- Utilidades de áudio ----------------------------------------------------
def db(val_db):  # helper
    return val_db

def mix_len(a, b_len):
    """Garante que o segmento 'a' tenha exatamente b_len (corta ou completa com silêncio)."""
    if len(a) > b_len:
        return a[:b_len]
    elif len(a) < b_len:
        return a + AudioSegment.silent(duration=b_len - len(a))
    return a

def humanize(ms, max_jitter):
    """Deslocamento aleatório em ms para humanização (pode ser negativo)."""
    return int(random.uniform(-max_jitter, max_jitter))

def overlay_at(track, hit, pos):
    """Sobrepõe 'hit' em 'track' na posição 'pos' (ms), com segurança."""
    pos = max(0, int(pos))
    return track.overlay(hit, position=pos)

# ---- Instrumentos Sintetizados ----------------------------------------------
class Kit:
    def __init__(self, gain=-12):
        self.gain = gain

    def surdo(self, f=60, d=180):
        x = Sine(f).to_audio_segment(duration=d).fade_in(5).fade_out(int(d*0.8)) - 4 + self.gain
        return x

    def caixa(self, d=80):
        noise = WhiteNoise().to_audio_segment(duration=d) - 6
        tone  = Sine(800).to_audio_segment(duration=d) - 12
        x = noise.overlay(tone).fade_out(int(d*0.8)) + self.gain
        return x

    def tamborim(self, d=55):
        return (Sine(1200).to_audio_segment(duration=d).fade_out(int(d*0.8)) - 10 + self.gain)

    def agogo(self, f=1800, d=90):
        return (Square(f).to_audio_segment(duration=d).fade_out(int(d*0.8)) - 12 + self.gain)

    def chocalho(self, d=110):
        return (WhiteNoise().to_audio_segment(duration=d).fade_in(5).fade_out(int(d*0.8)) - 14 + self.gain)

    def repique(self, d=85):
        return (Sine(450).to_audio_segment(duration=d).fade_out(int(d*0.8)) - 10 + self.gain)

    def tri(self, d=140):
        base = Sine(3000).to_audio_segment(duration=d)
        harm = Sine(4500).to_audio_segment(duration=d) - 6
        return (base.overlay(harm).fade_out(int(d*0.9)) - 14 + self.gain)

    def kick_jazz(self, d=120):  # bumbo “brushy”
        return (Sine(70).to_audio_segment(duration=d).fade_out(int(d*0.9)) - 6 + self.gain)

    def snare_brush(self, d=120):  # vassourinhas
        noise = WhiteNoise().to_audio_segment(duration=d) - 10
        tone  = Sine(300).to_audio_segment(duration=d) - 16
        return (noise.overlay(tone).fade_out(int(d*0.9)) + self.gain)

    def hat(self, d=70):
        return (WhiteNoise().to_audio_segment(duration=d) - 12 + self.gain)

    def drone_tanpura(self, f=220, d=400):
        base = Sine(f).to_audio_segment(duration=d)
        fifth = Sine(f*1.5).to_audio_segment(duration=d) - 6
        octave = Sine(f*2).to_audio_segment(duration=d) - 9
        return (base.overlay(fifth).overlay(octave).fade_out(int(d*0.9)) - 12)

# ---- Geradores de padrões (plug-ins) ----------------------------------------
def make_grid(total_ms, bpm, beats_per_bar, swing=0.0, human=0.0):
    """
    Retorna função helper para posicionar hits por subdivisão.
    swing: 0.0..0.6 (quanto maior, mais atraso na subdivisão par)
    human: jitter máximo em ms
    """
    beat = 60000.0 / bpm
    def pos(bar, subdiv_index, subdivs_per_beat):
        base = bar*beats_per_bar*beat + (subdiv_index/subdivs_per_beat)*beat
        # swing em subdivisões de colcheia (2 por beat)
        if subdivs_per_beat in (2, 4, 8):  # aplica swing em subdivisões pares
            # verifique se subdiv_index aponta para “&” da colcheia
            if (subdiv_index % 2 == 1):
                base += swing * (beat/3.0)  # atraso do & (terço do beat)
        return max(0, int(base + humanize(0, human)))
    return pos

def pat_samba(total_ms, bpm, swing, human, kit: Kit):
    beats_per_bar = 2
    beat = 60000.0 / bpm
    bars = math.ceil(total_ms / (beats_per_bar*beat))
    track = AudioSegment.silent(duration=total_ms)
    p = make_grid(total_ms, bpm, beats_per_bar, swing, human)

    for bar in range(bars):
        # surdo marcação
        track = overlay_at(track, kit.surdo(60, 180), p(bar, 0, 1))
        track = overlay_at(track, kit.surdo(60, 180), p(bar, 1, 1))
        # surdo resposta
        track = overlay_at(track, kit.surdo(85, 160), p(bar, 1, 2))  # contratempos
        track = overlay_at(track, kit.surdo(85, 160), p(bar, 3, 2))
        # caixa sincopada
        for i in (3, 7):
            track = overlay_at(track, kit.caixa(85), p(bar, i, 4))
        # tamborim rápido (semicolcheias: 8 por beat)
        for i in (0,2,4,6):
            track = overlay_at(track, kit.tamborim(55), p(bar, i, 4))
        # agogô alternado
        for i, f in enumerate([2000,1500,2000,1500]):
            track = overlay_at(track, kit.agogo(f, 90), p(bar, i, 2))
        # chocalho contínuo
        for i in range(8):
            track = overlay_at(track, kit.chocalho(110), p(bar, i, 4))
    return mix_len(track, total_ms)

def pat_baiana(total_ms, bpm, swing, human, kit: Kit):
    # mais denso/rua
    beats_per_bar = 2
    beat = 60000.0 / bpm
    bars = math.ceil(total_ms / (beats_per_bar*beat))
    track = AudioSegment.silent(duration=total_ms)
    p = make_grid(total_ms, bpm, beats_per_bar, swing, human)

    for bar in range(bars):
        for i in (0,1,2,3):
            track = overlay_at(track, kit.surdo(60 if i%2==0 else 80, 170), p(bar, i, 2))
        for i in (1,3,5,7):
            track = overlay_at(track, kit.repique(90), p(bar, i, 4))
        for i in (0,2,4,6):
            track = overlay_at(track, kit.caixa(85), p(bar, i, 4))
        for i in range(8):
            if random.random() > 0.35:
                track = overlay_at(track, kit.tamborim(55), p(bar, i, 4))
        # campana/agogo
        for i, f in enumerate([2200,1600,2200,1600]):
            track = overlay_at(track, kit.agogo(f, 90), p(bar, i, 2))
        for i in range(8):
            track = overlay_at(track, kit.chocalho(110), p(bar, i, 4))
    return mix_len(track, total_ms)

def pat_jazz_swing(total_ms, bpm, swing, human, kit: Kit):
    # 4/4 com vassourinha + ride (hat)
    beats_per_bar = 4
    beat = 60000.0 / bpm
    bars = math.ceil(total_ms / (beats_per_bar*beat))
    track = AudioSegment.silent(duration=total_ms)
    p = make_grid(total_ms, bpm, beats_per_bar, swing if swing>0 else 0.3, human)

    for bar in range(bars):
        # kick 1 e 3
        track = overlay_at(track, kit.kick_jazz(120), p(bar, 0, 1))
        track = overlay_at(track, kit.kick_jazz(120), p(bar, 2, 1))
        # snare brush 2 e 4
        track = overlay_at(track, kit.snare_brush(140), p(bar, 1, 1))
        track = overlay_at(track, kit.snare_brush(140), p(bar, 3, 1))
        # ride/hat em swing (colcheia tercinada)
        for i in range(8):  # 2 por beat
            track = overlay_at(track, kit.hat(70), p(bar, i, 2))
    return mix_len(track, total_ms)

def pat_blues_shuffle(total_ms, bpm, swing, human, kit: Kit):
    # 4/4 com shuffle forte (swing alto por padrão)
    beats_per_bar = 4
    beat = 60000.0 / bpm
    bars = math.ceil(total_ms / (beats_per_bar*beat))
    track = AudioSegment.silent(duration=total_ms)
    p = make_grid(total_ms, bpm, beats_per_bar, swing if swing>0 else 0.45, human)

    for bar in range(bars):
        # backbeat 2 e 4
        track = overlay_at(track, kit.caixa(120), p(bar, 1, 1))
        track = overlay_at(track, kit.caixa(120), p(bar, 3, 1))
        # bumbo em 1 e 3 (com ghost em 3+)
        track = overlay_at(track, kit.surdo(70,150), p(bar, 0, 1))
        track = overlay_at(track, kit.surdo(70,150), p(bar, 2, 1))
        track = overlay_at(track, kit.surdo(80,120) - 6, p(bar, 5, 2))
        # hat shuffle (triolado)
        for i in range(8):
            track = overlay_at(track, kit.hat(65), p(bar, i, 2))
    return mix_len(track, total_ms)

def pat_mantra_tala(total_ms, bpm, swing, human, kit: Kit, tala=8, drone_freq=220):
    """
    Tala simples (ex: 8 subdivisões por ciclo). Mantém drone contínuo,
    toques leves como ‘claps’/triângulo para marcação.
    """
    beat = 60000.0 / bpm
    cycle_ms = int((tala/2.0) * beat)  # aproximação: 2 subdivs ~ 1 beat
    cycles = math.ceil(total_ms / cycle_ms)
    track = AudioSegment.silent(duration=total_ms)

    # drone contínuo
    d = AudioSegment.silent(duration=0)
    while len(d) < total_ms:
        d += kit.drone_tanpura(drone_freq, 600)
    track = overlay_at(track, d[:total_ms] - 6, 0)

    # marcações
    for c in range(cycles):
        base = c*cycle_ms
        for i in range(tala):
            pos = base + int(i*(cycle_ms/tala)) + humanize(0, human)
            hit = kit.tri(120) if i==0 else (kit.tri(70) - 6)
            track = overlay_at(track, hit, pos)
    return mix_len(track, total_ms)

# ---- Roteamento de estilos ---------------------------------------------------
STYLE_MAP = {
    "samba": pat_samba,
    "batucada_baiana": pat_baiana,
    "jazz_swing": pat_jazz_swing,
    "blues_shuffle": pat_blues_shuffle,
    "mantra_tala": pat_mantra_tala,
}

# ---- Pipeline principal ------------------------------------------------------
def build_percussion(total_ms, style, bpm, swing, human, kit_gain, **kwargs):
    kit = Kit(gain=kit_gain)
    fn = STYLE_MAP.get(style)
    if not fn:
        raise ValueError(f"Estilo '{style}' não reconhecido. Opções: {', '.join(STYLE_MAP.keys())}")
    if style == "mantra_tala":
        return fn(total_ms, bpm, swing, human, kit, tala=kwargs.get("tala", 8), drone_freq=kwargs.get("drone_freq", 220))
    return fn(total_ms, bpm, swing, human, kit)

def main():
    ap = argparse.ArgumentParser(description="VOV Percussionizer — Arranjador Rítmico Livre")
    ap.add_argument("input", help="Arquivo de entrada (mp3/wav/m4a...)")
    ap.add_argument("-o","--output", help="Arquivo de saída (mp3). Padrão: *_vov_mix.mp3")
    ap.add_argument("--style", default="batucada_baiana",
                    choices=list(STYLE_MAP.keys()),
                    help="Estilo de percussão")
    ap.add_argument("--bpm", default="auto", help="BPM (número) ou 'auto'")
    ap.add_argument("--swing", type=float, default=0.0, help="Swing/Shuffle (0.0 a 0.6)")
    ap.add_argument("--human", type=float, default=8.0, help="Humanização (jitter) em ms")
    ap.add_argument("--wet", type=float, default=0.35, help="Proporção percussão no mix (0.0..1.0)")
    ap.add_argument("--gain", type=float, default=-10.0, help="Ganho base dos instrumentos (dB, valores negativos = mais baixo)")
    ap.add_argument("--export-stems", action="store_true", help="Exporta também stems: _original.mp3 e _perc.mp3")
    ap.add_argument("--tala", type=int, default=8, help="(mantra_tala) subdivisões por ciclo")
    ap.add_argument("--drone-freq", type=float, default=220.0, help="(mantra_tala) frequência base do drone")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(f"Erro: arquivo '{args.input}' não encontrado.")
        sys.exit(1)

    # carregar original
    try:
        orig = AudioSegment.from_file(args.input)
    except:
        try:
            orig = AudioSegment.from_mp3(args.input)
        except Exception as e:
            print("Falha ao ler o arquivo de entrada:", e)
            sys.exit(1)

    total_ms = len(orig)

    # BPM
    if args.bpm == "auto":
        bpm = detect_bpm_librosa(args.input)
        if bpm is None:
            print("BPM auto indisponível (librosa ausente). Informe --bpm N (ex: --bpm 100).")
            sys.exit(1)
        else:
            print(f"BPM detectado: {bpm:.1f}")
    else:
        try:
            bpm = float(args.bpm)
        except:
            print("Valor de --bpm inválido. Use número (ex: 100) ou 'auto'.")
            sys.exit(1)

    # construir percussão
    perc = build_percussion(
        total_ms=total_ms,
        style=args.style,
        bpm=bpm,
        swing=max(0.0, min(args.swing, 0.6)),
        human=max(0.0, args.human),
        kit_gain=args.gain,
        tala=args.tala,
        drone_freq=args.drone_freq
    )

    # dosar dry/wet
    wet = max(0.0, min(args.wet, 1.0))
    perc_adj = perc - 0  # pode ajustar aqui se quiser
    mix = orig.overlay(perc_adj - int((1.0-wet)*6))  # leve compensação

    base, _ = os.path.splitext(args.input)
    out_mix = args.output or f"{base}_vov_mix.mp3"
    out_perc = f"{base}_vov_perc.mp3"
    out_orig = f"{base}_vov_original.mp3"

    print("Exportando mix:", out_mix)
    mix.export(out_mix, format="mp3", bitrate="320k")

    if args.export_stems:
        print("Exportando stem percussão:", out_perc)
        perc.export(out_perc, format="mp3", bitrate="320k")
        print("Exportando stem original:", out_orig)
        orig.export(out_orig, format="mp3", bitrate="320k")

    print("\n✅ Concluído!\n")
    print(f"Estilo: {args.style} | BPM: {bpm:.1f} | Swing: {args.swing:.2f} | Human: {args.human:.1f}ms | Wet: {wet:.2f}")
    print(f"Arquivo final: {out_mix}")
    if args.export_stems:
        print(f"Stems: {out_perc}, {out_orig}")

if __name__ == "__main__":
    main()
