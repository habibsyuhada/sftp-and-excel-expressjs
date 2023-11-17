const { db_eng, db_portal, db_appv2 } = require(projectRoot+'/config/database');

const M_activity = {
	create: async (item) => {
		const columns = Object.keys(item).join(', ');
		const values = Object.values(item);
		const placeholders = Array.from({ length: values.length }, (_, i) => `$${i + 1}`).join(', ');

    const result = await db_eng.query(`INSERT INTO app_eng_activity(${columns}) VALUES (${placeholders}) RETURNING *`, values);
    return result.rows[0];
  },
	update: async (updates, whereConditions) => {
		const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
		const values = Object.values(updates);
	
		const whereClause = whereConditions.join(' AND ');
		
		const query = {
			text: `UPDATE app_eng_activity SET ${setClause} WHERE ${whereClause} RETURNING *`,
			values: [...values],
		};
	
		const result = await db_eng.query(query);
		return result.rows[0];
	},
	findByDocumentno: async (document_no) => {
    const result = await db_eng.query('SELECT * FROM app_eng_activity WHERE document_no = $1', [document_no]);
    return result.rows;
  },
};

const M_activity_detail = {
	create: async (item) => {
		const columns = Object.keys(item).join(', ');
		const values = Object.values(item);
		const placeholders = Array.from({ length: values.length }, (_, i) => `$${i + 1}`).join(', ');

    const result = await db_eng.query(`INSERT INTO app_eng_activity_detail(${columns}) VALUES (${placeholders}) RETURNING *`, values);
    return result.rows[0];
  },
};

const M_activity_revision = {
	create: async (item) => {
		const columns = Object.keys(item).join(', ');
		const values = Object.values(item);
		const placeholders = Array.from({ length: values.length }, (_, i) => `$${i + 1}`).join(', ');

    const result = await db_eng.query(`INSERT INTO app_eng_activity_revision(${columns}) VALUES (${placeholders}) RETURNING *`, values);
    return result.rows[0];
  },
};

const M_drawingType = {
	findAll: async () => {
    const result = await db_eng.query('SELECT * FROM master_drawing_type');
    return result.rows;
  },
};

const M_report = {
	findAll: async () => {
    const result = await db_eng.query('SELECT * FROM master_report_no');
    return result.rows;
  },
	findByCondition: async (item) => {
		let query = `SELECT * FROM master_report_no WHERE project = ${item.project} AND discipline =  ${item.discipline} AND module =  ${item.module} AND type_of_module =  ${item.type_of_module} AND drawing_type =  ${item.drawing_type}`;
    const result = await db_eng.query(query);
    return result.rows;
  },
};

const M_drawing_register = {
	get_transmittal_no_number: async (transmittal_no) => {
    const result = await db_eng.query("SELECT RIGHT(app_eng_drawing_register.transmittal_no,4) as kode FROM app_eng_drawing_register WHERE status_delete = 1 AND transmittal_no !='' AND transmittal_no LIKE '"+transmittal_no+"____' ORDER BY transmittal_no DESC LIMIT 1");
		let kode = 1;
		if(result.rows.length > 0){
			kode = result.rows[0].kode;
			kode = parseInt(kode, 10) + 1;
		}
		kode = String(kode).padStart(4, '0');
		return kode;
  },
	
	create: async (item) => {
		const columns = Object.keys(item).join(', ');
		const values = Object.values(item);
		const placeholders = Array.from({ length: values.length }, (_, i) => `$${i + 1}`).join(', ');

    const result = await db_eng.query(`INSERT INTO app_eng_drawing_register(${columns}) VALUES (${placeholders}) RETURNING *`, values);
    return result.rows[0];
  },
};

const M_project = {
	findAll: async () => {
    const result = await db_portal.query('SELECT id, project_code FROM portal_project');
    return result.rows;
  },
};

const M_module = {
	findAll: async () => {
    const result = await db_appv2.query('SELECT * FROM master_module');
    return result.rows;
  },
};

const M_discipline = {
	findAll: async () => {
    const result = await db_appv2.query('SELECT * FROM master_discipline');
    return result.rows;
  },
};

const M_deck_elevation = {
	findAll: async () => {
    const result = await db_appv2.query('SELECT * FROM master_deck_elevation');
    return result.rows;
  },
};

const M_desc_assy = {
	findAll: async () => {
    const result = await db_appv2.query('SELECT * FROM master_desc_assy');
    return result.rows;
  },
};

const M_type_of_module = {
	findAll: async () => {
    const result = await db_appv2.query('SELECT * FROM master_type_of_module');
    return result.rows;
  },
};

module.exports = {M_activity, M_activity_detail, M_activity_revision, M_drawingType, M_report, M_drawing_register, M_project, M_module, M_discipline, M_deck_elevation, M_desc_assy, M_type_of_module};