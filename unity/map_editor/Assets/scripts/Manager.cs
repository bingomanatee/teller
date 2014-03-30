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
		public string unit = "meters";
		public Units[] units = new Units[] {
				new Units ("Meters(m)", "m", 1),
				new Units ("Kilometers(km)", "km", 1000)
		};


		// Use this for initialization
		void Start ()
		{
				map = new Map ("New map");
		}
	
		// Update is called once per frame
		void Update ()
		{
	
		}

		public string UnitLabel ()
		{
				foreach (Units u in units) {
						if (u.id == unit) {
								return u.label;
						}
				}
				return "unknown";
		}

		public int MeterWidth ()
		{
				return Mathf.CeilToInt (width);
		}

		public int MeterDepth ()
		{
				return Mathf.CeilToInt (depth);
		}

		public void Create ()
		{
				map.Create (MeterWidth (), MeterDepth ());
				created = true;
		}
}
