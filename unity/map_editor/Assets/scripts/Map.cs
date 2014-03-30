using UnityEngine;
using System.Collections;

public class Map
{
		public string name = "Unnamed";
		public int width = 128;
		public int depth = 128;
		GameObject terrain;

		public Map (string pName)
		{
				name = pName;
		}

		public void Create (int pWidth, int pDepth)
		{
				width = pWidth;
				depth = pDepth;

				TerrainData td = new TerrainData ();
				td.heightmapResolution = 513;
				td.baseMapResolution = 512;
				td.SetDetailResolution (1024, 128);

				td.size = new Vector3 (width, 1000, depth);
				terrain = (GameObject)Terrain.CreateTerrainGameObject (td);
				terrain.transform.position = new Vector3 (-width / 2, 0, -depth / 2);
		}

}
