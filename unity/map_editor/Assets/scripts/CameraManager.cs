using UnityEngine;
using System.Collections;

public class CameraManager : MonoBehaviour
{
		const float FLOAT_HEIGHT = 20f;
		const float FLOAT_MIN = 10f;
		public Manager manager;
		float pushToTerrain = 0;

		// Use this for initialization
		void Start ()
		{
	
		}
	
		// Update is called once per frame
		void Update ()
		{
				if (manager.created) {
						Terrain ter = manager.map.GetTerrain ();
						float y = gameObject.transform.position.y;
				
						float terrainHeight = 0;
						float targetHeight = terrainHeight + FLOAT_HEIGHT;

						for (int rangex = -20; rangex <= 20; rangex += 5) {
								for (int rangey = -20; rangey <= 20; rangey += 5) {
										terrainHeight = Mathf.Max (terrainHeight, ter.terrainData.GetHeight ((int)transform.position.x + rangex, (int)transform.position.y + rangey));
								}
						}
						if (targetHeight < y) {
								pushToTerrain -= 0.01f;
						} else {
								pushToTerrain += 0.03f;
						}

						float distRatio = Mathf.Abs (targetHeight - y) / 5.0f;
						pushToTerrain *= Mathf.Clamp (distRatio, 0f, 0.99f);

			y = Mathf.Max (y + pushToTerrain, terrainHeight + FLOAT_MIN);
						gameObject.transform.position = new Vector3 (gameObject.transform.position.x, y, gameObject.transform.position.z);
				}
		}
}
