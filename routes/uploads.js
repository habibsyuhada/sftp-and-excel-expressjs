const express = require('express');
const path = require('path');
const router = express.Router();
const exceljs = require('exceljs');
const moment = require('moment');
const FileHandler = require(projectRoot+'/config/sftp');
const { M_activity, M_activity_detail, M_activity_revision, M_drawingType, M_report, M_drawing_register, M_project, M_module, M_discipline, M_deck_elevation, M_desc_assy, M_type_of_module } = require(projectRoot+'/models/masterData');
const fs = require('fs');

router.get('/', async (req, res) => {
	const filePath = path.join(projectRoot, 'file', 'Excel Template.xlsx');

	datadb = await M_drawingType.findAll();
	const drawing_type_list = {};
	datadb.forEach((value) => {
		drawing_type_list[value['code']] = value['id']
	});

	datadb = await M_project.findAll();
	const project_list = {};
	datadb.forEach((value) => {
		project_list[value['project_code']] = value['id']
	});

	datadb = await M_module.findAll();
	const module_list = {};
	datadb.forEach((value) => {
		if (!module_list[value['project_id']]) {
			module_list[value['project_id']] = {};
		}
		module_list[value['project_id']][value['mod_desc']] = value['mod_id'];
	});

	datadb = await M_discipline.findAll();
	const discipline_list = {};
	datadb.forEach((value) => {
		discipline_list[value['initial']] = value['id'];
	});

	datadb = await M_deck_elevation.findAll();
	const deck_elevation_list = {};
	datadb.forEach((value) => { 
		deck_elevation_list[value['code']] = value['id']; 
	});

	datadb = await M_desc_assy.findAll();
	const desc_assy_list = {};
	datadb.forEach((value) => { 
		desc_assy_list[value['code']] = value['id']; 
	});

	datadb = await M_type_of_module.findAll();
	const type_of_module_list = {};
	datadb.forEach((value) => {
		type_of_module_list[value['code']] = value['id'];
	});

	const status_internal_list = {
		"No" : 0,
		"Yes" : 1,
	};

	const user_init = {
		"LN" : 195,
		"AYU" : 1001785,
		"JML" : 189,
		"DIN" : 1000105,
		"RKA" : 206,
		"RK" : 206,
		"WH" : 201,
		"DH" : 1000179,
		"DV" : 1000168,
		"HS" : 76,
	};

	try {
		
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const data = [];
		const activity_list = {};
		const warning = [];
		const check_duplicate_drawing = [];

		const columns = [''];
    worksheet.eachRow((row, rowNumber) => {
			if(rowNumber == 1){
				row.eachCell((cell) => {
					columns.push(cell.value);
				});
			}
			else{
				const rowData = {};

				row.eachCell((cell, colNumber) => {
					const colName = columns[colNumber];
        	rowData[colName] = cell.value;
				});
				data.push(rowData);
			}
    });

		const draft_submit_date = '2023-11-13 12:56:00';
		const checker_approval_date = '2023-11-13 12:56:01';
		const engineer_approval_date = '2023-11-13 12:56:02';
		const transmittal_date = '2023-11-13 12:56:03';

		const transmittal_list = {};

		for (const value of data) {
			const checkFile = projectRoot+'/file/drawing/'+value['Document Number']+'.pdf';

			datadb = await M_activity.findByDocumentno(value['Document Number']);

			if (!fs.existsSync(checkFile)) {
				console.log("File " + value['Document Number'] + " Is Not Found!");
				warning.push("File " + value['Document Number'] + " Is Not Found!");
				continue;
			}
			else if (!(value['Drafter'] in user_init)) {
				console.log("Initial User for " + value['Drafter'] + " Is Not Found!");
				warning.push("Error: Initial User for " + value['Drafter'] + " on " + value["Document Number"] + " Is Not Found!");
				continue;
			}
			else if (!(value['Checker'] in user_init)) {
				console.log("Initial User for " + value['Checker'] + " Is Not Found!");
				warning.push("Error: Initial User for " + value['Checker'] + " on " + value["Document Number"] + " Is Not Found!");
				continue;
			}
			else if (!(value['Engineer'] in user_init)) {
				console.log("Initial User for " + value['Engineer'] + " Is Not Found!");
				warning.push("Error: Initial User for " + value['Engineer'] + " on " + value["Document Number"] + " Is Not Found!");
				continue;
			}
			else if (!(value['Doccon'] in user_init)) {
				console.log("Initial User for " + value['Doccon'] + " Is Not Found!");
				warning.push("Error: Initial User for " + value['Doccon'] + " on " + value["Document Number"] + " Is Not Found!");
				continue;
			}
			else if (datadb.length > 0) {
				console.log("Duplicate Drawing for " + value['Document Number'] + " on Database!");
				warning.push("Duplicate Drawing for " + value['Document Number'] + " on Database!");
				continue;
			}
			else if (value['Document Number'] in check_duplicate_drawing) {
				console.log("Duplicate Drawing for " + value['Document Number'] + " on Excel!");
				warning.push("Duplicate Drawing for " + value['Document Number'] + " on Excel!");
				continue;
			}
			
			check_duplicate_drawing.push(value['Document Number']);

			// INSERT TO ACTIVITY
			form_data = {
				'drawing_ga' : value['GA Document Number'],
				'document_no' : value['Document Number'],
				'project_id' : project_list[value['Project']],
				'drawing_type' : drawing_type_list[value['Drawing Type']],
				'module' : module_list[project_list[value['Project']]][value['Module']],
				'type_of_module' : type_of_module_list[value['Type of Module']],
				'discipline' : discipline_list[value['Discipline']],
				'deck_elevation' : deck_elevation_list[value['Deck Elevation']],
				'desc_assy' : desc_assy_list[value['Desc Assy']],
				'title' : value['Title'],
				'client_design_ref' : value['Client Design Reference'],
				'client_doc_no' : value['Client Doc No'],
				'status_internal' : status_internal_list[value['Internal (Yes / No)']],
				'created_by' : 999999,
				'created_date' : moment().format('YYYY-MM-DD HH:mm:ss'),
				'drafter' : user_init[value['Drafter']],
				'draft_submit_by' : user_init[value['Drafter']],
				'draft_submit_date' : draft_submit_date,
				'draft_submit_status' : 1,
				'checker_approval_by' : user_init[value['Checker']],
				'checker_approval_date' : checker_approval_date,
				'checker_approval_status' : 3,
				'engineer_approval_by' : user_init[value['Engineer']],
				'engineer_approval_date' : engineer_approval_date,
				'engineer_approval_status' : 3,
				'transmittal_no' : '',
				'transmittal_by' : user_init[value['Doccon']],
				'transmittal_date' : transmittal_date,
				'transmittal_status' : 1,
				'revision_no' : '01',
				'last_revision_no' : '01',
				'revision_status' : 0,
				'status' : 2,
				'checker_assigned' : user_init[value['Checker']],
			};

			const activity = await M_activity.create(form_data);
			activity_list[activity.id] = activity;			

			const key = activity['project_id'] + '|' + activity['discipline'] + '|' + activity['module'] + '|' + activity['type_of_module'] + '|' + activity['drawing_type'];
			if (!transmittal_list[key]) {
				transmittal_list[key] = [];
			}
			transmittal_list[key].push(activity.id);

			// INSERT TO ACTIVITY DETAIL FOR DRAFTER
			form_data = {
				'id_activity': activity['id'],
				'id_user': user_init[value['Drafter']],
				'category': 'Drafter',
				'start_time': draft_submit_date,
				'stop_time': draft_submit_date,
				'status': 1,
				'action_approval': 1,
			};
			await M_activity_detail.create(form_data);

			// INSERT TO ACTIVITY DETAIL FOR CHECKER
			form_data = {
				'id_activity': activity['id'],
				'id_user': user_init[value['Checker']],
				'category': 'Checker',
				'start_time': checker_approval_date,
				'stop_time': checker_approval_date,
				'status': 1,
				'action_approval': 3,
			};
			await M_activity_detail.create(form_data);

			// INSERT TO ACTIVITY DETAIL FOR ENGINEER
			form_data = {
				'id_activity': activity['id'],
				'id_user': user_init[value['Engineer']],
				'category': 'Engineer',
				'start_time': engineer_approval_date,
				'stop_time': engineer_approval_date,
				'status': 1,
				'action_approval': 3,
			};
			await M_activity_detail.create(form_data);

			// INSERT TO ACTIVITY DETAIL FOR DOCCON
			form_data = {
				'id_activity': activity['id'],
				'id_user': user_init[value['Doccon']],
				'category': 'Document Control',
				'start_time': transmittal_date,
				'stop_time': transmittal_date,
				'status': 1,
				'action_approval': 4,
			};
			await M_activity_detail.create(form_data);

			// UPLOAD FILE TO SINOLOGI
			const localFilePath = projectRoot+'/file/drawing/'+activity['document_no']+'.pdf';

      const timestamp = moment().format('YYYYMMDDHHmmss');
      const extension = path.extname(localFilePath);
			const newFileName = `999999-${activity['id']}-${timestamp}${extension}`;

			const remoteFilePath = '/file_uploads/'+newFileName;

			const fileHandler = new FileHandler();
			await fileHandler.uploadFile(localFilePath, remoteFilePath);

			// INSERT TO ACTIVITY REVISION
			form_data = {
				'id_activity' 	: activity['id'],
				'rev_no' 				: '01',
				'revision_no' 	: activity['document_no'],
				'remarks' 			: '01',
				'attachment' 		: newFileName,
				'revision_by' 	: user_init[value['Drafter']],
				'transmittal_file' 	: 2,
			};
			await M_activity_revision.create(form_data);
		}

		for (const [key, value] of Object.entries(transmittal_list)) {
			try {
				const conArray = key.split('|');
				const datadb = await M_report.findByCondition({
					"project": conArray[0],
					"discipline": conArray[1],
					"module": conArray[2],
					"type_of_module": conArray[3],
					"drawing_type": conArray[4],
				});
		
				if (datadb.length === 0) {
					console.log("ERROR: Discipline still didn't have transmittal number format!", conArray, datadb);
				} else {
					let transmittal_no = datadb[0]['report_no'];
					const last_no = await M_drawing_register.get_transmittal_no_number(transmittal_no);
					transmittal_no = transmittal_no + last_no;
		
					form_data = {
						"transmittal_no": transmittal_no,
					};
					const idList = value.join(',');
					await M_activity.update(form_data, ["id IN (" + idList + ")"]);

					for (const id_activity of value) {
						let status = 0;
						if([3, 10, 11].includes(activity_list[id_activity]['drawing_type'])){
							status = 2;
						}
						form_data = {
							'id_activity' : activity_list[id_activity]['id'],
							'project_id' : activity_list[id_activity]['project_id'],
							'document_no' : activity_list[id_activity]['document_no'],
							'drawing_ga' : activity_list[id_activity]['drawing_ga'],
							'drawing_type' : activity_list[id_activity]['drawing_type'],
							'discipline' : activity_list[id_activity]['discipline'],
							'module' : activity_list[id_activity]['module'],
							'title' : activity_list[id_activity]['title'],
							'transmittal_no' : transmittal_no,
							'transmittal_by' : activity_list[id_activity]['transmittal_by'],
							'transmittal_date' : activity_list[id_activity]['transmittal_date'],
							'notif_pmt' : activity_list[id_activity]['notif_pmt'],
							'notif_pmt_by' : activity_list[id_activity]['notif_pmt_by'],
							'notif_pmt_date' : activity_list[id_activity]['notif_pmt_date'],
							'revision_no' : activity_list[id_activity]['revision_no'],
							'revision_date' : activity_list[id_activity]['revision_date'],
							'last_revision_no' : activity_list[id_activity]['last_revision_no'],
							'id_file_revision' : activity_list[id_activity]['id'],
							'upload_file_by' : activity_list[id_activity]['revision_by'],
							'upload_file_date' : activity_list[id_activity]['revision_date'],
							'attachment' : activity_list[id_activity]['attachment'],
							'remarks' : activity_list[id_activity]['remarks'],
							'status' : status,
						};

						await M_drawing_register.create(form_data);
					}
				}
			} catch (error) {
				console.error("Error:", error);
			}
		}		

    res.json({ warning });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
