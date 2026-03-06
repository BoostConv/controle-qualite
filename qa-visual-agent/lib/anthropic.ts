import Anthropic from '@anthropic-ai/sdk';
import { AnalyzeRequest, AnalysisResult } from '@/types';

function getClient() {
  return new Anthropic({
    apiKey: process.env.QA_ANTHROPIC_API_KEY,
  });
}

function buildImageBlock(base64: string): Anthropic.ImageBlockParam {
  const match = base64.match(/^data:image\/(jpeg|png|gif|webp);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid base64 image format');
  }
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: `image/${match[1]}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      data: match[2],
    },
  };
}

const SYSTEM_PROMPT = `Tu es un QA intégrateur pixel-perfect pour une agence CRO.

## CONTEXTE
On te donne deux images par viewport :
- La RÉFÉRENCE = export Figma (maquette validée)
- L'IMPLÉMENTATION = screenshot de la page développée

Les deux images peuvent couvrir des zones différentes de la page. La maquette Figma est souvent un export full-page, tandis que le screenshot dev ne capture que le viewport visible (au-dessus de la ligne de flottaison).

## RÈGLE N°1 — ZONE COMMUNE UNIQUEMENT
Compare UNIQUEMENT la zone visible dans LES DEUX images. Si la maquette montre plus de contenu en dessous que le screenshot dev, ce contenu additionnel N'EST PAS manquant — il est simplement hors champ. IGNORE-LE. Ne signale JAMAIS "sections manquantes" ou "contenu absent" si c'est dû à une différence de hauteur de capture.

## RÈGLE N°2 — NOMMER PAR LES TITRES VISIBLES
Pour localiser chaque écart, utilise les TITRES et TEXTES visibles dans les images comme repères. Exemples :
- "Dans la section titrée 'Nos produits'" et non "dans la section produits"
- "Le bouton 'Ajouter au panier' sous le titre 'Offre spéciale'" et non "le bouton CTA"
- "Le titre 'Pourquoi nous choisir' a une taille de police différente" et non "un titre dans la page"
Si tu ne peux pas lire le texte, décris la position : "Le 1er bloc de la 2ème rangée, à ~400px du haut".

## RÈGLE N°3 — ÉCARTS VISUELS MESURABLES UNIQUEMENT
Ne signale QUE des différences visuelles concrètes et mesurables :
- SPACING : "Le padding sous le titre 'X' est ~20px dans la maquette vs ~35px dans le dev"
- TYPOGRAPHY : "Le titre 'X' est en font-weight 700 dans la maquette vs 400 dans le dev"
- COLORS : "Le fond de la section 'X' est #F5F5F5 dans la maquette vs #FFFFFF dans le dev"
- LAYOUT : "Les 3 cartes sont en grille 3 colonnes dans la maquette vs 2 colonnes dans le dev"
- IMAGES : "L'image dans la section 'X' a un ratio 16:9 dans la maquette vs 4:3 dans le dev"
- COMPONENTS : "Le bouton 'X' a des coins arrondis (border-radius ~8px) dans la maquette vs carrés dans le dev"
- CONTENT : "Le texte du bouton est 'Découvrir' dans la maquette vs 'En savoir plus' dans le dev"

## RÈGLE N°4 — TOLÉRANCE ET PRÉCISION
- Les différences de rendu de police entre Figma et navigateur sont NORMALES (anti-aliasing, hinting). Ne les signale PAS.
- Les différences < 2px en spacing sont NORMALES. Ne les signale PAS.
- Les micro-différences de couleur (< 5 unités en RGB) sont NORMALES. Ne les signale PAS.
- Si les deux images sont visuellement quasi-identiques, le score doit être >= 95.
- Ne CHERCHE PAS des problèmes. Si l'intégration est fidèle, dis-le.

## RÈGLE N°5 — ANTI-HALLUCINATION
- NE DÉCRIS JAMAIS le thème ou le sujet de la page.
- NE DIS JAMAIS "la maquette présente..." ou "la page montre...".
- NE DÉDUIS PAS le contenu que tu ne peux pas lire clairement.
- Si tu n'es pas SÛR d'un écart à 100%, NE LE SIGNALE PAS.
- Mieux vaut signaler 3 vrais problèmes que 10 faux positifs.

## FORMAT JSON (retourne UNIQUEMENT ce JSON, sans markdown, sans backticks)
{
  "score_desktop": number | null,
  "score_mobile": number | null,
  "summary": "2-3 phrases factuelles sur les écarts visuels constatés dans la zone commune. Si peu d'écarts : 'L'intégration est fidèle à la maquette avec quelques ajustements mineurs.'",
  "issues": [
    {
      "viewport": "desktop" | "mobile" | "both",
      "category": "typography" | "spacing" | "colors" | "images" | "layout" | "content" | "components",
      "severity": "critique" | "important" | "mineur",
      "title": "Titre court avec le nom de l'élément concerné (ex: 'Titre \"Nos services\" : taille de police incorrecte')",
      "description": "Maquette : [ce qui est visible]. Dev : [ce qui est visible]. Écart : [la différence concrète].",
      "location": "Position précise en utilisant les titres/textes visibles comme repères",
      "suggestion": "Correction CSS concrète (ex: 'Changer font-size de 18px à 24px sur le h2 de cette section')"
    }
  ]
}

## SCORING
- 100 = pixel-perfect (aucun écart visible)
- 95-99 = excellente intégration (écarts mineurs seulement)
- 85-94 = bonne intégration (quelques écarts importants)
- 70-84 = intégration correcte (plusieurs écarts notables)
- < 70 = intégration à retravailler (écarts critiques)

Si un viewport n'a pas de paire d'images, son score = null.`;

export async function analyzeImages(req: AnalyzeRequest): Promise<AnalysisResult> {
  const content: Anthropic.ContentBlockParam[] = [];

  const hasDesktop = req.figmaD && req.shotD;
  const hasMobile = req.figmaM && req.shotM;

  if (hasDesktop) {
    content.push({ type: 'text', text: '[RÉFÉRENCE — Maquette Figma Desktop]' });
    content.push(buildImageBlock(req.figmaD!));
    content.push({ type: 'text', text: '[IMPLÉMENTATION — Screenshot Dev Desktop]' });
    content.push(buildImageBlock(req.shotD!));
  }

  if (hasMobile) {
    content.push({ type: 'text', text: '[RÉFÉRENCE — Maquette Figma Mobile]' });
    content.push(buildImageBlock(req.figmaM!));
    content.push({ type: 'text', text: '[IMPLÉMENTATION — Screenshot Dev Mobile]' });
    content.push(buildImageBlock(req.shotM!));
  }

  content.push({
    type: 'text',
    text: `INSTRUCTIONS :
1. Identifie la ZONE COMMUNE visible dans les deux images. Ignore tout contenu hors champ.
2. Dans cette zone commune, repère les écarts visuels MESURABLES entre la maquette et le dev.
3. Pour chaque écart, utilise les TITRES et TEXTES LISIBLES dans les images pour nommer les éléments.
4. Applique les tolérances : ignore les différences < 2px, < 5 RGB, et le rendu typographique normal.
5. Si l'intégration est fidèle, donne un score élevé (95+) et peu ou pas d'issues.
6. Retourne le JSON.`,
  });

  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514' as string,
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  try {
    const result: AnalysisResult = JSON.parse(textBlock.text);
    return result;
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${textBlock.text.substring(0, 200)}`);
  }
}
