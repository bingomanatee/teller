using UnityEngine;
using System.Collections;

public struct Units
{
		public string label;
		public string id;
		public int scale;

		public Units (string pLabel, string pID, int pScale)
		{
				scale = pScale;
				id = pID;
				label = pLabel;
		}
};

public class Manager : MonoBehaviour
{

		public Map map;
		public string mode = "";
		public bool created = false;
		public float width = 128f;
		public float depth = 128f;
		public string unit = "km";
		public GameObject baseTerrain;
		public Units[] units = new Units[] {
				new Units ("Meters(m)", "m", 1),
				new Units ("Kilometers(km)", "km", 1000)
		};

		public void ModeChange (string pMode)
		{
				mode = pMode;
				switch (pMode.ToLower ()) {

				case "move": 
						break;

				case "sculpt": 
						break;

				case "paint":
						break;

				}

				
		}

		// Use this for initialization
		void Start ()
		{
				map = new Map ("New map");
		}


		// Update is called once per frame
		void Update ()
		{
	
		}

		public Units UnitData ()
		{
				foreach (Units u in units) {
						if (u.id == unit) {
								return u;
						}
				}
				return new Units ("Unknown", "", 1);
		}

		public int MeterWidth ()
		{
				return Mathf.CeilToInt (width * UnitData ().scale);
		}

		public int MeterDepth ()
		{
				return Mathf.CeilToInt (depth * UnitData ().scale);
		}

		public void Create ()
		{
				map.Create (MeterWidth (), MeterDepth ());
				map.SetTextures (((Terrain)baseTerrain.GetComponent ("Terrain")).terrainData.splatPrototypes);
				created = true;
			//	ProxyTerrainToolkit ().PerlinGenerator (5, 0.75f, 3, 1.0f);
				//map.SetHeights (ProxyTerrain ().terrainData.GetHeights (0, 0, Map.TERRAIN_HEIGHTMAP_RES, Map.TERRAIN_HEIGHTMAP_RES));
				
		}
	
		Terrain ProxyTerrain ()
		{
				return (Terrain)(baseTerrain.GetComponent ("Terrain"));
		}
	
		TerrainToolkit ProxyTerrainToolkit ()
		{
				return ((TerrainToolkit)baseTerrain.GetComponent ("TerrainToolkit"));
		}
	
}
