using UnityEngine;
using System.Collections;

public class Map :ScriptableObject
{
		public int width = 128;
		public int depth = 128;
		public const int MAX_TERRAIN_HEIGHTMAP_RES = 2048;
		public const int MIN_TERRAIN_HEIGHTMAP_RES = 512;
		public int terrain_res;
		GameObject terrain;
		public bool created = false;

		public Map (string pName)
		{
				name = pName.Length > 0 ? pName : "Unnamed";
		}

		public int MapSize ()
		{
				return Mathf.Max (this.width, this.depth);
		}

		public int HeightmapRes ()
		{
				int res = Mathf.ClosestPowerOfTwo (this.MapSize ());
				res = Mathf.Clamp (res, MIN_TERRAIN_HEIGHTMAP_RES, MAX_TERRAIN_HEIGHTMAP_RES);
				Debug.Log (" heightmap res: " + res);
				return res;
		}

		public void Create (int pWidth, int pDepth)
		{
				if (created && terrain) {
						Destroy (terrain);
				}
				
				width = pWidth;
				depth = pDepth;

				TerrainData td = new TerrainData ();
				td.heightmapResolution = HeightmapRes () + 1;
				td.baseMapResolution = HeightmapRes ();
				td.SetDetailResolution (HeightmapRes () * 2, 8);

				td.size = new Vector3 (width, 600, depth);
				terrain = (GameObject)Terrain.CreateTerrainGameObject (td);
				terrain.transform.position = new Vector3 (-width / 2, 0, -depth / 2);

				int frequency = MapSize () / 1000;
				frequency = Mathf.Clamp (frequency, 1, 100);
				Debug.Log ("Frequency: " + frequency.ToString ());

				Flatten (0.33f);
				if (frequency > 2) {
						Toolkit ().PerlinGenerator (frequency, 0.75f, 3, 0.25f);
				}
		
				created = true;
		}

		public TerrainToolkit Toolkit ()
		{
				if (!terrain)
						return null;
				if (!terrain.GetComponent ("TerrainToolkit")) {
						terrain.AddComponent ("TerrainToolkit");
				}
				return (TerrainToolkit)terrain.GetComponent ("TerrainToolkit");

		}

		public void SetTextures (SplatPrototype[] splats)
		{
				GetTerrain ().terrainData.splatPrototypes = splats;
		}

		public void Flatten (float height)
		{
				TerrainData td = GetTerrain ().terrainData;
				float[,] heights = td.GetHeights (0, 0, td.heightmapWidth, td.heightmapHeight);
				for (int h = 0; h < td.heightmapHeight; ++h)
						for (int w = 0; w < td.heightmapWidth; ++w) {
								heights [w, h] = height;
						}
				SetHeights (heights);
		}

		public void SetHeights (float[,] heights)
		{
				GetTerrain ().terrainData.SetHeights (0, 0, heights);
		}

		public Terrain GetTerrain ()
		{
				if (terrain) {
						return (Terrain)terrain.GetComponent ("Terrain");
				} else {
						return null;
				}
		}

		public void SetTexturesByHeight (Texture2D cliffTexture, Texture2D sandTexture, Texture2D grassTexture, Texture2D rockTexture)
		{
				float[] slopeStops = new float[2]{20.0f, 50.0f};
				float[] heightStops = new float[4]{0.2f, 0.4f, 0.6f, 0.8f};
				Texture2D[] textures = new Texture2D[4]{
						cliffTexture,
						sandTexture,
						grassTexture,
						rockTexture
			};
				((TerrainToolkit)terrain.GetComponent ("TerrainToolkit")).TextureTerrain (slopeStops, heightStops, textures);
		}

}
