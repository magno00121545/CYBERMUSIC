import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { Package, Song } from '../../src/types/index.js';

export const catalogRoutes = Router();

// List Categories
catalogRoutes.get('/categories', (req: Request, res: Response) => {
  const db = getDb();
  const activeOnly = req.query.all !== 'true';

  let categories = db.categories.filter(c => !activeOnly || c.is_active);
  categories.sort((a, b) => a.display_order - b.display_order);

  // Compute package count for each category
  const categoriesWithCount = categories.map(c => {
    const count = db.packages.filter(p => p.category_id === c.id && p.is_active).length;
    return {
      ...c,
      packages_count: count,
    };
  });

  return res.json(categoriesWithCount);
});

// List Packages (with search, category filter, sorting)
catalogRoutes.get('/packages', (req: Request, res: Response) => {
  const db = getDb();
  const { category, search, filter, sort } = req.query;

  let packages = db.packages.filter(p => p.is_active);

  // Category Filtering - match by category ID, slug, or name
  if (category && category !== 'all') {
    const qCat = (category as string).toLowerCase().trim();
    const matchedCategory = db.categories.find(c =>
      c.id.toLowerCase() === qCat ||
      c.slug.toLowerCase() === qCat ||
      c.name.toLowerCase() === qCat ||
      c.name.toLowerCase().includes(qCat) ||
      qCat.includes(c.slug.toLowerCase())
    );

    if (matchedCategory) {
      packages = packages.filter(p => p.category_id === matchedCategory.id);
    } else {
      packages = packages.filter(p => 
        p.category_id.toLowerCase() === qCat || 
        p.slug.toLowerCase().includes(qCat)
      );
    }
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    packages = packages.filter(p => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      // Also match if any song in package matches
      const matchSong = db.songs.some(s => s.package_id === p.id && (s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)));
      return matchTitle || matchDesc || matchSong;
    });
  }

  // Filter by tags / highlights
  if (filter === 'featured' || filter === 'destaques') {
    packages = packages.filter(p => p.is_featured);
  } else if (filter === 'bestseller' || filter === 'mais-vendidos') {
    packages = packages.filter(p => p.is_bestseller);
  } else if (filter === 'new' || filter === 'novidades') {
    packages = packages.filter(p => p.is_new);
  }

  // Sorting
  if (sort === 'price_asc') {
    packages.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
  } else if (sort === 'price_desc') {
    packages.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
  } else if (sort === 'newest') {
    packages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    packages.sort((a, b) => a.display_order - b.display_order);
  }

  // Populate category name and total tracks
  const enriched = packages.map(pkg => {
    const cat = db.categories.find(c => c.id === pkg.category_id);
    const songsInPkg = db.songs.filter(s => s.package_id === pkg.id);
    return {
      ...pkg,
      category_name: cat ? cat.name : 'Geral',
      total_tracks: songsInPkg.length || pkg.total_tracks,
    };
  });

  return res.json(enriched);
});

// Single Package Details with songs
catalogRoutes.get('/packages/:id', (req: Request, res: Response) => {
  const db = getDb();
  const pkg = db.packages.find(p => p.id === req.params.id || p.slug === req.params.id);

  if (!pkg) {
    return res.status(404).json({ error: 'Pacote não encontrado.' });
  }

  const cat = db.categories.find(c => c.id === pkg.category_id);
  const songs = db.songs
    .filter(s => s.package_id === pkg.id)
    .sort((a, b) => a.track_number - b.track_number);

  return res.json({
    ...pkg,
    category_name: cat ? cat.name : 'Geral',
    songs,
  });
});

// Deep Global Search
catalogRoutes.get('/search', (req: Request, res: Response) => {
  const db = getDb();
  const q = ((req.query.q as string) || '').toLowerCase().trim();

  if (!q) {
    return res.json({ packages: [], songs: [], categories: [] });
  }

  const matchedCategories = db.categories.filter(c => c.is_active && c.name.toLowerCase().includes(q));

  const matchedPackages = db.packages
    .filter(p => p.is_active && (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
    .map(p => {
      const cat = db.categories.find(c => c.id === p.category_id);
      return { ...p, category_name: cat?.name };
    });

  const matchedSongs = db.songs
    .filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    .slice(0, 15)
    .map(s => {
      const pkg = db.packages.find(p => p.id === s.package_id);
      return {
        ...s,
        package_title: pkg?.title || 'Pacote CYBER',
        package_cover: pkg?.cover_image,
      };
    });

  return res.json({
    categories: matchedCategories,
    packages: matchedPackages,
    songs: matchedSongs,
  });
});
