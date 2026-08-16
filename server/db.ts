import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Category, Package, Song, Order, OrderItem, Payment, DownloadRecord, Coupon, AppNotification, ActivityLog } from '../src/types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const BACKUPS_DIR = path.join(process.cwd(), 'backups');
const DB_FILE = path.join(DATA_DIR, 'cyber_music_db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(path.join(UPLOADS_DIR, 'covers'))) fs.mkdirSync(path.join(UPLOADS_DIR, 'covers'), { recursive: true });
if (!fs.existsSync(path.join(UPLOADS_DIR, 'audio'))) fs.mkdirSync(path.join(UPLOADS_DIR, 'audio'), { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

export interface DatabaseSchema {
  users: User[];
  user_passwords: Record<string, string>; // user_id -> password_hash
  categories: Category[];
  packages: Package[];
  songs: Song[];
  orders: Order[];
  payments: Payment[];
  downloads: DownloadRecord[];
  coupons: Coupon[];
  notifications: AppNotification[];
  settings: Record<string, any>;
  activity_logs: ActivityLog[];
}

let dbInstance: DatabaseSchema | null = null;

function seedDatabase(): DatabaseSchema {
  const adminId = 'usr_admin_01';
  const editorId = 'usr_editor_01';
  const suporteId = 'usr_suporte_01';
  const clienteId = 'usr_cliente_01';

  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const editorHash = bcrypt.hashSync('editor123', salt);
  const suporteHash = bcrypt.hashSync('suporte123', salt);
  const clienteHash = bcrypt.hashSync('cliente123', salt);

  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: adminId,
      name: 'Cyber Admin',
      username: 'admin',
      email: 'admin@cybermusic.com',
      role: 'ADMIN',
      phone: '(11) 98888-0001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: editorId,
      name: 'Carlos DJ (Editor)',
      username: 'carlos',
      email: 'editor@cybermusic.com',
      role: 'EDITOR',
      phone: '(11) 98888-0002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: suporteId,
      name: 'Mariana Suporte',
      username: 'mariana',
      email: 'suporte@cybermusic.com',
      role: 'SUPORTE',
      phone: '(11) 98888-0003',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    },
    {
      id: clienteId,
      name: 'Lucas Produtor',
      username: 'lucas',
      email: 'cliente@gmail.com',
      role: 'USER',
      phone: '(21) 99999-7777',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: now,
    }
  ];

  const user_passwords: Record<string, string> = {
    [adminId]: adminHash,
    [editorId]: editorHash,
    [suporteId]: suporteHash,
    [clienteId]: clienteHash,
  };

  const categories: Category[] = [
    {
      id: 'cat_funk',
      name: 'Funk',
      slug: 'funk',
      icon: 'Flame',
      description: 'Mandelão, 150BPM, Funk RJ, SP, Consciente e Acapellas Exclusivas',
      display_order: 1,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_forro',
      name: 'Forró & Piseiro',
      slug: 'forro-piseiro',
      icon: 'Music',
      description: 'Piseiro de Vaquejada, Forró Eletrônico, Xote e Repertórios Atualizados',
      display_order: 2,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_sertanejo',
      name: 'Sertanejo',
      slug: 'sertanejo',
      icon: 'Guitar',
      description: 'Sertanejo Universitário, Modão Raiz, Arrocha e Acústicos VIP',
      display_order: 3,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_eletronica',
      name: 'Eletrônica & EDM',
      slug: 'eletronica-edm',
      icon: 'Radio',
      description: 'Tech House, Brazilian Bass, Slap House, Psytrance e Melodic Techno',
      display_order: 4,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_flashback',
      name: 'Flashback 80s / 90s',
      slug: 'flashback',
      icon: 'Disc',
      description: 'Eurodance, Synthwave, Disco 80, Pop 90 e Remixes Retrô',
      display_order: 5,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_gospel',
      name: 'Gospel & Worship',
      slug: 'gospel',
      icon: 'Heart',
      description: 'Louvores, Adoração, Playbacks e Acapellas Gospel',
      display_order: 6,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_internacional',
      name: 'Internacional & Pop',
      slug: 'internacional',
      icon: 'Globe',
      description: 'Top Billboard, Reggaeton, Afrobeat, Hip-Hop e R&B Hits',
      display_order: 7,
      is_active: true,
      created_at: now,
    },
    {
      id: 'cat_mix',
      name: 'Mega Mix & DJ Sets',
      slug: 'mega-mix',
      icon: 'Layers',
      description: 'Intros editadas, Vinhetas, Transições e Mashups prontos para pista',
      display_order: 8,
      is_active: true,
      created_at: now,
    }
  ];

  const packages: Package[] = [
    {
      id: 'pkg_funk_01',
      title: 'SUPER PACK FUNK 2026 - MANDELÃO & 150BPM VIP',
      slug: 'super-pack-funk-2026',
      description: 'A pasta definitiva para DJs de Funk! Mais de 120 faixas masterizadas em 320kbps, incluindo versões Clean, Extended, Intro Mix e Acapellas prontas para tocar nos fluxos.',
      category_id: 'cat_funk',
      cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      price: 29.90,
      discount_price: 19.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 1,
      total_size: 850 * 1024 * 1024, // 850 MB
      total_tracks: 12,
      created_at: now,
    },
    {
      id: 'pkg_funk_02',
      title: 'FUNK BH & BEAT FINO 2026 - GRAVES PESADOS & STEMS',
      slug: 'funk-bh-beat-fino-2026',
      description: 'Seleção especial com os maiores estouros do Funk de Belo Horizonte, beats finos, montagens exclusivas e acapellas isoladas.',
      category_id: 'cat_funk',
      cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      price: 34.90,
      discount_price: 24.90,
      is_active: true,
      is_featured: true,
      is_bestseller: false,
      is_new: true,
      display_order: 2,
      total_size: 720 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_sertanejo_01',
      title: 'MEGA REPERTÓRIO SERTANEJO UNIVERSITÁRIO VIP',
      slug: 'mega-repertorio-sertanejo-vip',
      description: 'Seleção completa com os maiores lançamentos e regravações de sucessos sertanejos universitários em alta fidelidade.',
      category_id: 'cat_sertanejo',
      cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      price: 34.90,
      discount_price: 22.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 3,
      total_size: 780 * 1024 * 1024,
      total_tracks: 9,
      created_at: now,
    },
    {
      id: 'pkg_sertanejo_02',
      title: 'MODÃO BRUTO & ARROCHA DOS PAREDÕES 2026',
      slug: 'modao-bruto-arrocha-paredoes',
      description: 'Os maiores clássicos e modões regravados com batida de arrocha e percussão de paredão. Ideal para eventos e botecos.',
      category_id: 'cat_sertanejo',
      cover_image: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&auto=format&fit=crop&q=80',
      price: 29.90,
      discount_price: 19.90,
      is_active: true,
      is_featured: false,
      is_bestseller: true,
      is_new: true,
      display_order: 4,
      total_size: 690 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_eletronica_01',
      title: 'CYBER TECH HOUSE & BRAZILIAN BASS 2026',
      slug: 'cyber-tech-house-brazilian-bass',
      description: 'Produções de altíssimo impacto sonoro. Linhas de baixo pesadas, synths analógicos e drops insanos no padrão dos maiores festivais mundiais.',
      category_id: 'cat_eletronica',
      cover_image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80',
      price: 39.90,
      discount_price: 24.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 5,
      total_size: 1100 * 1024 * 1024, // 1.1 GB
      total_tracks: 10,
      created_at: now,
    },
    {
      id: 'pkg_eletronica_02',
      title: 'MELODIC TECHNO & SLAP HOUSE FESTIVAL PACK',
      slug: 'melodic-techno-slap-house-2026',
      description: 'Synths espaciais, vocais marcantes e construções progressivas para sets imersivos e pistas lotadas.',
      category_id: 'cat_eletronica',
      cover_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
      price: 39.90,
      discount_price: 29.90,
      is_active: true,
      is_featured: true,
      is_bestseller: false,
      is_new: true,
      display_order: 6,
      total_size: 980 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_forro_01',
      title: 'PISEIRO & FORRÓ DOS PAREDÕES ATUALIZADO 2026',
      slug: 'piseiro-forro-paredoes-2026',
      description: 'O repertório que está estourado no Nordeste e nos paredões de todo o Brasil. Versões exclusivas de shows e estúdio com percussão reforçada.',
      category_id: 'cat_forro',
      cover_image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
      price: 24.90,
      discount_price: 14.90,
      is_active: true,
      is_featured: false,
      is_bestseller: true,
      is_new: true,
      display_order: 7,
      total_size: 650 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_forro_02',
      title: 'VAQUEJADA VIP & FORRÓ ELETRÔNICO EXPANDED',
      slug: 'vaquejada-vip-forro-eletronico',
      description: 'Músicas completas com metais pesados, sanfona marcante e baterias eletrônicas masterizadas.',
      category_id: 'cat_forro',
      cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      price: 29.90,
      discount_price: 19.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: false,
      display_order: 8,
      total_size: 710 * 1024 * 1024,
      total_tracks: 7,
      created_at: now,
    },
    {
      id: 'pkg_gospel_01',
      title: 'MEGA PACK GOSPEL 2026 - LOUVORES, PLAYBACKS & WORSHIP',
      slug: 'mega-pack-gospel-2026',
      description: 'Mais de 80 faixas com os maiores louvores do Brasil, playbacks originais com backing vocals, arranjos worship e stems para ministérios de louvor.',
      category_id: 'cat_gospel',
      cover_image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
      price: 39.90,
      discount_price: 24.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 9,
      total_size: 920 * 1024 * 1024,
      total_tracks: 10,
      created_at: now,
    },
    {
      id: 'pkg_gospel_02',
      title: 'WORSHIP REMIX & ACAPELLAS GOSPEL BRASIL',
      slug: 'worship-remix-acapellas-gospel',
      description: 'Remixes eletrônicos congregacionais e acapellas isoladas com timbres de piano e pads orquestrais.',
      category_id: 'cat_gospel',
      cover_image: 'https://images.unsplash.com/photo-1445743432342-eac500ce72b7?w=600&auto=format&fit=crop&q=80',
      price: 29.90,
      discount_price: 19.90,
      is_active: true,
      is_featured: false,
      is_bestseller: true,
      is_new: true,
      display_order: 10,
      total_size: 680 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_flashback_01',
      title: 'FLASHBACK SUPREME - 80s & 90s EXTENDED REMIXES',
      slug: 'flashback-supreme-80s-90s',
      description: 'Clássicos atemporais da Dance Music e Pop internacional com intros longas e batidas remasterizadas para pista.',
      category_id: 'cat_flashback',
      cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      price: 29.90,
      discount_price: 19.90,
      is_active: true,
      is_featured: false,
      is_bestseller: true,
      is_new: false,
      display_order: 11,
      total_size: 920 * 1024 * 1024,
      total_tracks: 10,
      created_at: now,
    },
    {
      id: 'pkg_flashback_02',
      title: 'EURODANCE 90s & DISCO 80s CLUB MASTER EDIT',
      slug: 'eurodance-90s-disco-80s-club',
      description: 'Hinos que marcaram época com equalização analógica moderna e batidas 128 a 135 BPM.',
      category_id: 'cat_flashback',
      cover_image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop&q=80',
      price: 34.90,
      discount_price: 22.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 12,
      total_size: 850 * 1024 * 1024,
      total_tracks: 8,
      created_at: now,
    },
    {
      id: 'pkg_internacional_01',
      title: 'TOP BILLBOARD & REGGAETON HITS 2026 (EXTENDED)',
      slug: 'top-billboard-reggaeton-2026',
      description: 'As músicas mais tocadas no mundo com edições para DJs: intro, outro, acapella in e clean edits.',
      category_id: 'cat_internacional',
      cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
      price: 39.90,
      discount_price: 29.90,
      is_active: true,
      is_featured: true,
      is_bestseller: true,
      is_new: true,
      display_order: 13,
      total_size: 990 * 1024 * 1024,
      total_tracks: 10,
      created_at: now,
    },
    {
      id: 'pkg_mix_01',
      title: 'DJ TOOLKIT 2026 - INTROS, MASHUPS & TRANSITIONS',
      slug: 'dj-toolkit-2026-mashups-intros',
      description: 'Ferramentas essenciais para sets dinâmicos: transições de BPM de 100 para 150, acapella loops, vinhetas de impacto e mashups exclusivos.',
      category_id: 'cat_mix',
      cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      price: 49.90,
      discount_price: 34.90,
      is_active: true,
      is_featured: true,
      is_bestseller: false,
      is_new: true,
      display_order: 14,
      total_size: 1400 * 1024 * 1024,
      total_tracks: 12,
      created_at: now,
    }
  ];

  const songs: Song[] = [
    // Funk tracks
    {
      id: 'sng_f1',
      package_id: 'pkg_funk_01',
      title: 'Mandelão Cybernetic 150BPM (VIP Extended)',
      artist: 'DJ Cyber SP',
      duration_seconds: 214,
      file_path: 'cyber_mandelao_vip.mp3',
      file_size: 8.5 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_f2',
      package_id: 'pkg_funk_01',
      title: 'Grave de Quebrada 2026 (Intro Beat)',
      artist: 'MC Veloce & DJ Neon',
      duration_seconds: 198,
      file_path: 'grave_quebrada.mp3',
      file_size: 7.9 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 2,
      created_at: now,
    },
    {
      id: 'sng_f3',
      package_id: 'pkg_funk_01',
      title: 'Baile no Espaço (Acapella + Instrumental)',
      artist: 'Tropa do Cyber',
      duration_seconds: 230,
      file_path: 'baile_espaco.wav',
      file_size: 34.2 * 1024 * 1024,
      file_format: 'wav',
      track_number: 3,
      created_at: now,
    },
    {
      id: 'sng_f4',
      package_id: 'pkg_funk_01',
      title: 'Montagem Rave dos Paredões',
      artist: 'DJ Megasom',
      duration_seconds: 185,
      file_path: 'montagem_rave.mp3',
      file_size: 7.4 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 4,
      created_at: now,
    },
    {
      id: 'sng_f5',
      package_id: 'pkg_funk_02',
      title: 'Belo Horizonte Beat Fino 2026',
      artist: 'DJ BH Master',
      duration_seconds: 190,
      file_path: 'bh_beat_fino.mp3',
      file_size: 7.6 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Sertanejo tracks
    {
      id: 'sng_s1',
      package_id: 'pkg_sertanejo_01',
      title: 'Chorando no Balcão (Versão EletroSertanejo)',
      artist: 'Dupla Nova Geração',
      duration_seconds: 220,
      file_path: 'chorando_balcao.mp3',
      file_size: 8.8 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_s2',
      package_id: 'pkg_sertanejo_01',
      title: 'Seu Adeus Foi Meu Recomeço (Ao Vivo VIP)',
      artist: 'Gustavo & Rafael',
      duration_seconds: 205,
      file_path: 'seu_adeus.mp3',
      file_size: 8.2 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 2,
      created_at: now,
    },
    {
      id: 'sng_s3',
      package_id: 'pkg_sertanejo_02',
      title: 'Modão do Arrocha Pesado 2026',
      artist: 'Os Brutos do Arrocha',
      duration_seconds: 195,
      file_path: 'modao_arrocha.mp3',
      file_size: 7.8 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Eletronica tracks
    {
      id: 'sng_e1',
      package_id: 'pkg_eletronica_01',
      title: 'Neon Pulse (Original Club Mix)',
      artist: 'Alexandre Quantum',
      duration_seconds: 342,
      file_path: 'neon_pulse_club.mp3',
      file_size: 13.7 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_e2',
      package_id: 'pkg_eletronica_01',
      title: 'Sub Zero Bassline (Extended Festival Edit)',
      artist: 'Bass Dimension',
      duration_seconds: 289,
      file_path: 'sub_zero_bassline.flac',
      file_size: 42.1 * 1024 * 1024,
      file_format: 'flac',
      track_number: 2,
      created_at: now,
    },
    {
      id: 'sng_e3',
      package_id: 'pkg_eletronica_01',
      title: 'Midnight in Tokyo (Tech Groove)',
      artist: 'Kaito & Cyber Crew',
      duration_seconds: 315,
      file_path: 'midnight_tokyo.mp3',
      file_size: 12.6 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 3,
      created_at: now,
    },
    {
      id: 'sng_e4',
      package_id: 'pkg_eletronica_02',
      title: 'Astral Journey (Melodic Techno Edit)',
      artist: 'Solaris Project',
      duration_seconds: 360,
      file_path: 'astral_journey.mp3',
      file_size: 14.4 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Forro tracks
    {
      id: 'sng_p1',
      package_id: 'pkg_forro_01',
      title: 'Vaquejada Moderna 2026 (Ao Vivo Especial)',
      artist: 'Os Reis do Piseiro',
      duration_seconds: 205,
      file_path: 'vaquejada_moderna.mp3',
      file_size: 8.2 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_p2',
      package_id: 'pkg_forro_01',
      title: 'Coração de Paredão (Extended Mix)',
      artist: 'Forró Eletrônico VIP',
      duration_seconds: 194,
      file_path: 'coracao_paredao.mp3',
      file_size: 7.8 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 2,
      created_at: now,
    },
    {
      id: 'sng_p3',
      package_id: 'pkg_forro_02',
      title: 'Forró de Vaqueiro Pesado (Metais VIP)',
      artist: 'Banda Sanfonaço',
      duration_seconds: 215,
      file_path: 'forro_vaqueiro.mp3',
      file_size: 8.6 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Gospel tracks
    {
      id: 'sng_g1',
      package_id: 'pkg_gospel_01',
      title: 'Rei dos Reis (Playback Oficial com Backing)',
      artist: 'Worship Brasil Collective',
      duration_seconds: 310,
      file_path: 'rei_dos_reis_playback.mp3',
      file_size: 12.4 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_g2',
      package_id: 'pkg_gospel_01',
      title: 'Céus Abertos (Arranjo Orquestral ao Vivo)',
      artist: 'Ministério Aliança',
      duration_seconds: 285,
      file_path: 'ceus_abertos.wav',
      file_size: 44.0 * 1024 * 1024,
      file_format: 'wav',
      track_number: 2,
      created_at: now,
    },
    {
      id: 'sng_g3',
      package_id: 'pkg_gospel_02',
      title: 'Graça Infinita (Worship Deep Remix 2026)',
      artist: 'DJ Gospel Beats',
      duration_seconds: 240,
      file_path: 'graca_infinita_remix.mp3',
      file_size: 9.6 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Flashback tracks
    {
      id: 'sng_fb1',
      package_id: 'pkg_flashback_01',
      title: '80s Synth Anthem (Retrowave 2026 Redo)',
      artist: 'Retro Masters',
      duration_seconds: 275,
      file_path: 'synth_anthem_80s.mp3',
      file_size: 11.0 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },
    {
      id: 'sng_fb2',
      package_id: 'pkg_flashback_02',
      title: 'Rhythm of Eurodance 90s (Extended Club Mix)',
      artist: 'Euro Club Project',
      duration_seconds: 320,
      file_path: 'eurodance_extended.mp3',
      file_size: 12.8 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Internacional tracks
    {
      id: 'sng_int1',
      package_id: 'pkg_internacional_01',
      title: 'Global Dance Anthem 2026 (Intro Clean)',
      artist: 'World Chart Hitters',
      duration_seconds: 235,
      file_path: 'global_dance.mp3',
      file_size: 9.4 * 1024 * 1024,
      file_format: 'mp3',
      track_number: 1,
      created_at: now,
    },

    // Mix & Toolkit
    {
      id: 'sng_m1',
      package_id: 'pkg_mix_01',
      title: 'Transition Tool: 128 to 150 BPM Mega Drop',
      artist: 'Cyber DJ Tools',
      duration_seconds: 120,
      file_path: 'trans_128_150.wav',
      file_size: 19.5 * 1024 * 1024,
      file_format: 'wav',
      track_number: 1,
      created_at: now,
    }
  ];

  // Seed a sample paid order for Lucas Produtor (cliente@gmail.com)
  const orderId = 'ord_demo_001';
  const paymentId = 'pay_demo_001';
  const orders: Order[] = [
    {
      id: orderId,
      order_number: 'CM-2026-9041',
      user_id: clienteId,
      user_name: 'Lucas Produtor',
      user_email: 'cliente@gmail.com',
      total_amount: 19.90,
      discount_amount: 0,
      coupon_code: null,
      status: 'PAID',
      payment_id: paymentId,
      created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 5 + 45000).toISOString(),
      items: [
        {
          id: 'item_001',
          order_id: orderId,
          package_id: 'pkg_funk_01',
          package_title: 'SUPER PACK FUNK 2026 - MANDELÃO & 150BPM VIP',
          package_cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
          price_at_purchase: 19.90,
          total_tracks: 12,
          total_size: 850 * 1024 * 1024,
        }
      ]
    }
  ];

  const payments: Payment[] = [
    {
      id: paymentId,
      order_id: orderId,
      method: 'PIX',
      pix_qr_code: '',
      pix_copy_paste: '00020126580014br.gov.bcb.pix0136cyberplay484@gmail.com520400005303986540519.905802BR5919CYBER MUSIC DIGITAL6009SAO PAULO62070503***6304E8A2',
      tx_id: 'TX_CM_9041_PROD',
      status: 'PAID',
      paid_at: new Date(Date.now() - 3600 * 1000 * 5 + 45000).toISOString(),
      expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
      amount: 19.90,
    }
  ];

  const downloads: DownloadRecord[] = [
    {
      id: 'dl_demo_01',
      user_id: clienteId,
      user_email: 'cliente@gmail.com',
      order_id: orderId,
      package_id: 'pkg_funk_01',
      package_title: 'SUPER PACK FUNK 2026 - MANDELÃO & 150BPM VIP',
      song_id: 'sng_f1',
      song_title: 'Mandelão Cybernetic 150BPM (VIP Extended)',
      ip_address: '177.18.29.112',
      downloaded_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    }
  ];

  const coupons: Coupon[] = [
    {
      id: 'cpn_cyber10',
      code: 'CYBER10',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      min_order_value: 15.00,
      max_uses: 500,
      uses_count: 32,
      expires_at: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
      is_active: true,
      created_at: now,
    },
    {
      id: 'cpn_bemvindo20',
      code: 'BEMVINDO20',
      discount_type: 'PERCENTAGE',
      discount_value: 20,
      min_order_value: 10.00,
      max_uses: 1000,
      uses_count: 85,
      expires_at: new Date(Date.now() + 60 * 86400 * 1000).toISOString(),
      is_active: true,
      created_at: now,
    },
    {
      id: 'cpn_promo5',
      code: 'PROMO5',
      discount_type: 'FIXED',
      discount_value: 5.00,
      min_order_value: 20.00,
      max_uses: 200,
      uses_count: 14,
      expires_at: new Date(Date.now() + 15 * 86400 * 1000).toISOString(),
      is_active: true,
      created_at: now,
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif_welcome',
      title: '🔥 Bem-vindo ao CYBER MUSIC!',
      message: 'Explore nossos pacotes de áudio exclusivos para DJs e produtores. Utilize o cupom BEMVINDO20 para 20% OFF.',
      type: 'PROMO',
      target_user_id: null,
      link: '/#pacotes',
      is_read: false,
      created_at: now,
    },
    {
      id: 'notif_launch',
      title: '⚡ Lançamento: Pacote Mandelão 2026',
      message: 'Novas faixas em 150BPM com acapellas e stems já disponíveis no catálogo.',
      type: 'PACKAGE',
      target_user_id: null,
      link: '/package/pkg_funk_01',
      is_read: false,
      created_at: now,
    }
  ];

  const settings = {
    platform_name: 'CYBER MUSIC',
    support_email: 'suporte@cybermusic.com',
    support_whatsapp: '(11) 98888-0000',
    pix_key: 'cyberplay484@gmail.com',
    pix_beneficiary: 'CYBER MUSIC DIGITAL BRASIL',
    pix_city: 'SAO PAULO',
    allow_guest_browse: true,
    maintenance_mode: false,
    download_token_expiry_minutes: 30,
    max_upload_size_mb: 500,
  };

  const activity_logs: ActivityLog[] = [
    {
      id: 'log_seed_01',
      user_id: adminId,
      user_email: 'admin@cybermusic.com',
      action: 'SYSTEM_BOOT',
      details: 'Sistema CYBER MUSIC inicializado com banco de dados centralizado.',
      ip: '127.0.0.1',
      created_at: now,
    }
  ];

  return {
    users,
    user_passwords,
    categories,
    packages,
    songs,
    orders,
    payments,
    downloads,
    coupons,
    notifications,
    settings,
    activity_logs,
  };
}

export function getDb(): DatabaseSchema {
  if (dbInstance) return dbInstance;

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(data);
      // Ensure all arrays exist in case of schema migrations
      if (!dbInstance!.users) dbInstance!.users = [];
      if (!dbInstance!.user_passwords) dbInstance!.user_passwords = {};
      if (!dbInstance!.categories) dbInstance!.categories = [];
      if (!dbInstance!.packages) dbInstance!.packages = [];
      if (!dbInstance!.songs) dbInstance!.songs = [];
      if (!dbInstance!.orders) dbInstance!.orders = [];
      if (!dbInstance!.payments) dbInstance!.payments = [];
      if (!dbInstance!.downloads) dbInstance!.downloads = [];
      if (!dbInstance!.coupons) dbInstance!.coupons = [];
      if (!dbInstance!.notifications) dbInstance!.notifications = [];
      if (!dbInstance!.settings) dbInstance!.settings = {};
      if (!dbInstance!.activity_logs) dbInstance!.activity_logs = [];
      
      // Migration: Add username to users if missing
      dbInstance!.users.forEach((user: any) => {
        if (!('username' in user)) {
          user.username = (user.email ? user.email.split('@')[0] : 'user') + '_' + (user.id ? user.id.slice(-4) : '0000');
        }
      });
      
      return dbInstance!;
    }
  } catch (err) {
    console.error('Error loading DB, creating fresh seed:', err);
  }

  dbInstance = seedDatabase();
  saveDb();
  return dbInstance!;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(dbInstance, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist DB:', err);
  }
}

export function createBackup(): { filename: string; timestamp: string; size: number } {
  const db = getDb();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_cybermusic_${timestamp}.json`;
  const filepath = path.join(BACKUPS_DIR, filename);

  const backupData = JSON.stringify(db, null, 2);
  fs.writeFileSync(filepath, backupData, 'utf-8');
  const stat = fs.statSync(filepath);

  return {
    filename,
    timestamp: new Date().toISOString(),
    size: stat.size,
  };
}

export function listBackups(): Array<{ filename: string; createdAt: string; size: number }> {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  const files = fs.readdirSync(BACKUPS_DIR);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const p = path.join(BACKUPS_DIR, f);
      const stat = fs.statSync(p);
      return {
        filename: f,
        createdAt: stat.mtime.toISOString(),
        size: stat.size,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function restoreBackup(filename: string): boolean {
  const filepath = path.join(BACKUPS_DIR, filename);
  if (!fs.existsSync(filepath)) return false;
  const content = fs.readFileSync(filepath, 'utf-8');
  dbInstance = JSON.parse(content);
  saveDb();
  return true;
}

export function logActivity(userId: string | undefined, userEmail: string | undefined, action: string, details: string, ip: string = '127.0.0.1'): void {
  const db = getDb();
  const log: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    user_email: userEmail,
    action,
    details,
    ip,
    created_at: new Date().toISOString(),
  };
  db.activity_logs.unshift(log);
  if (db.activity_logs.length > 500) {
    db.activity_logs = db.activity_logs.slice(0, 500);
  }
  saveDb();
}
