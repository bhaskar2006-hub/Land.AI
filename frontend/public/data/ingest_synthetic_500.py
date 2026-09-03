"""
Ingestion script for 500 synthetic land record documents and parcels.
"""
import os
import csv
import json

DATA_DIR = "/Users/bhaskarreddy/Land.AI/backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

# Parse the user-provided data directly into CSVs and GeoJSON
raw_text_docs = """document_id,parcel_id,ocr_survey_number,ocr_owner_name,ocr_area_acres,ocr_village,ocr_confidence,extraction_status,validation_issue
DOC-00001,P0001,101/1,Synthetic Owner 001,14.2205,Example Village,0.9504,Extracted,
DOC-00002,P0002,102,Synthetic Owner 002,14.2205,Example Village,0.9568,Extracted,
DOC-00003,P0003,103,Synthetic Owner 003,14.2205,Example Village,0.7206,Extracted,Missing mutation information
DOC-00004,P0004,104,Synthetic Owner 004,14.2205,Example Village,0.8468,Extracted,Missing mutation information
DOC-00005,P0005,105,Synthetic Owner 005,14.2205,Example Village,0.9773,Extracted,
DOC-00006,P0006,106/3,Synthetic Owner 006,14.2205,Example Village,0.939,Extracted,
DOC-00007,P0007,107,Synthetic Owner 007,14.2205,Example Village,0.9665,Extracted,
DOC-00008,P0008,108,Synthetic Owner 008,14.2205,Example Village,0.9611,Extracted,
DOC-00009,P0009,109,Synthetic Owner 009,14.2205,Example Village,0.9504,Extracted,
DOC-00010,P0010,110,Synthetic Owner 010,14.2205,Example Village,0.9599,Extracted,
DOC-00011,P0011,111/2,Synthetic Owner 011,14.2205,Example Village,0.9523,Extracted,
DOC-00012,P0012,112,Synthetic Owner 012,14.2205,Example Village,0.6934,Extracted,Survey number uncertainty
DOC-00013,P0013,113,Synthetic Owner 013,14.2205,Example Village,0.7687,Extracted,Possible duplicate
DOC-00014,P0014,114,Synthetic Owner 014,14.2205,Example Village,0.9472,Extracted,
DOC-00015,P0015,115,Synthetic Owner 015,14.2205,Example Village,0.9425,Extracted,
DOC-00016,P0016,116/1,Synthetic Owner 016,14.2205,Example Village,0.9481,Extracted,
DOC-00017,P0017,117,Synthetic Owner 017,14.2205,Example Village,0.9446,Extracted,
DOC-00018,P0018,118,Synthetic Owner 018,14.2205,Example Village,0.9801,Extracted,
DOC-00019,P0019,119,Synthetic Owner 019,14.2205,Example Village,0.7847,Extracted,Low OCR confidence
DOC-00020,P0020,120,Synthetic Owner 020,14.2205,Example Village,0.9506,Extracted,
DOC-00021,P0021,121/3,Synthetic Owner 021,14.2205,Example Village,0.9664,Extracted,
DOC-00022,P0022,122,Synthetic Owner 022,14.2205,Example Village,0.9769,Extracted,
DOC-00023,P0023,123,Synthetic Owner 023,14.2205,Example Village,0.9379,Extracted,
DOC-00024,P0024,124,Synthetic Owner 024,14.2205,Example Village,0.5443,Needs Review,Survey number uncertainty
DOC-00025,P0025,125,Synthetic Owner 025,14.2205,Example Village,0.9832,Extracted,
DOC-00026,P0026,126/2,Synthetic Owner 026,14.2203,Example Village,0.6488,Needs Review,Low OCR confidence
DOC-00027,P0027,127,Synthetic Owner 027,14.2203,Example Village,0.43,Needs Review,Survey number uncertainty
DOC-00028,P0028,128,Synthetic Owner 028,14.2203,Example Village,0.9726,Extracted,
DOC-00029,P0029,129,Synthetic Owner 029,14.2203,Example Village,0.9611,Extracted,
DOC-00030,P0030,130,Synthetic Owner 030,14.2203,Example Village,0.503,Needs Review,Survey number uncertainty
DOC-00031,P0031,131/1,Synthetic Owner 031,14.2203,Example Village,0.9753,Extracted,
DOC-00032,P0032,132,Synthetic Owner 032,14.2203,Example Village,0.9371,Extracted,
DOC-00033,P0033,133,Synthetic Owner 033,14.2203,Example Village,0.9681,Extracted,
DOC-00034,P0034,134,Synthetic Owner 034,15.3579,Example Village,0.6545,Extracted,Area mismatch
DOC-00035,P0035,135,Synthetic Owner 035,14.2203,Example Village,0.9447,Extracted,
DOC-00036,P0036,136/3,Synthetic Owner 036,14.2203,Example Village,0.9334,Extracted,
DOC-00037,P0037,137,Synthetic Owner 037,14.2203,Example Village,0.9515,Extracted,
DOC-00038,P0038,138,Synthetic Owner 038,14.2203,Example Village,0.7816,Extracted,Low OCR confidence
DOC-00039,P0039,139,Synthetic Owner 039,14.2203,Example Village,0.9303,Extracted,
DOC-00040,P0040,140,Synthetic Owner 040,14.2203,Example Village,0.9936,Extracted,
DOC-00041,P0041,141/2,Synthetic Owner 041,14.2203,Example Village,0.9564,Extracted,
DOC-00042,P0042,142,Synthetic Owner 042,14.2203,Example Village,0.7123,Extracted,Missing mutation information
DOC-00043,P0043,143,Synthetic Owner 043,14.2203,Example Village,0.9791,Extracted,
DOC-00044,P0044,144,Synthetic Owner 044,14.2203,Example Village,0.9509,Extracted,
DOC-00045,P0045,145,Synthetic Owner 045,14.2203,Example Village,0.9338,Extracted,
DOC-00046,P0046,146/1,Synthetic Owner 046,14.2203,Example Village,0.9358,Extracted,
DOC-00047,P0047,147,Synthetic Owner 047,14.2203,Example Village,0.9451,Extracted,
DOC-00048,P0048,148,Synthetic Owner 048,14.2203,Example Village,0.977,Extracted,
DOC-00049,P0049,149,Synthetic Owner 049,14.2203,Example Village,0.9894,Extracted,
DOC-00050,P0050,150,Synthetic Owner 050,14.2203,Example Village,0.9572,Extracted,
DOC-00051,P0051,151/3,Synthetic Owner 051,15.3578,Example Village,0.7549,Extracted,Area mismatch
DOC-00052,P0052,152,Synthetic Owner 052,14.2202,Example Village,0.9948,Extracted,
DOC-00053,P0053,153,Synthetic Owner 053,14.2202,Example Village,0.9812,Extracted,
DOC-00054,P0054,154,Synthetic Owner 054,14.2202,Example Village,0.7656,Extracted,Survey number uncertainty
DOC-00055,P0055,155,Synthetic Owner 055,14.2202,Example Village,0.987,Extracted,
DOC-00056,P0056,156/2,Synthetic Owner 056,14.2202,Example Village,0.9494,Extracted,
DOC-00057,P0057,157,Synthetic Owner 057,14.2202,Example Village,0.937,Extracted,
DOC-00058,P0058,158,Synthetic Owner 058,14.2202,Example Village,0.9485,Extracted,
DOC-00059,P0059,159,Synthetic Owner 059,14.2202,Example Village,0.9653,Extracted,
DOC-00060,P0060,160,Synthetic Owner 060,14.2202,Example Village,0.9878,Extracted,
DOC-00061,P0061,161/1,Synthetic Owner 061,14.2202,Example Village,0.9853,Extracted,
DOC-00062,P0062,162,Synthetic Owner 062,14.2202,Example Village,0.6156,Needs Review,Missing mutation information
DOC-00063,P0063,163,Synthetic Owner 063,14.2202,Example Village,0.9515,Extracted,
DOC-00064,P0064,164,Synthetic Owner 064,14.2202,Example Village,0.9598,Extracted,
DOC-00065,P0065,165,Synthetic Owner 065,14.2202,Example Village,0.6133,Needs Review,Possible duplicate
DOC-00066,P0066,166/3,Synthetic Owner 066,14.2202,Example Village,0.8189,Extracted,Missing mutation information
DOC-00067,P0067,167,Synthetic Owner 067,14.2202,Example Village,0.6878,Extracted,Survey number uncertainty
DOC-00068,P0068,168,Synthetic Owner 068,14.2202,Example Village,0.9697,Extracted,
DOC-00069,P0069,169,Synthetic Owner 069,14.2202,Example Village,0.9883,Extracted,
DOC-00070,P0070,170,Synthetic Owner 070,14.2202,Example Village,0.9578,Extracted,
DOC-00071,P0071,171/2,Synthetic Owner 071,14.2202,Example Village,0.9356,Extracted,
DOC-00072,P0072,172,Synthetic Owner 072,14.2202,Example Village,0.6128,Needs Review,Low OCR confidence
DOC-00073,P0073,173,Synthetic Owner 073,14.2202,Example Village,0.961,Extracted,
DOC-00074,P0074,174,Synthetic Owner 074,14.2202,Example Village,0.9304,Extracted,
DOC-00075,P0075,175,Synthetic Owner 075,14.2202,Example Village,0.9453,Extracted,
DOC-00076,P0076,176/1,Synthetic Owner 076,14.2201,Example Village,0.9474,Extracted,
DOC-00077,P0077,177,Synthetic Owner 077,14.2201,Example Village,0.9496,Extracted,
DOC-00078,P0078,178,Synthetic Owner 078,14.2201,Example Village,0.5539,Needs Review,Possible duplicate
DOC-00079,P0079,179,Synthetic Owner 079,14.2201,Example Village,0.9534,Extracted,
DOC-00080,P0080,180,Synthetic Owner 080,14.2201,Example Village,0.934,Extracted,
DOC-00081,P0081,181/3,Synthetic Owner 081,14.2201,Example Village,0.9603,Extracted,
DOC-00082,P0082,182,Synthetic Owner 082,14.2201,Example Village,0.7833,Extracted,Missing mutation information
DOC-00083,P0083,183,Synthetic Owner 083,14.2201,Example Village,0.9877,Extracted,
DOC-00084,P0084,184,Synthetic Owner 084,14.2201,Example Village,0.9502,Extracted,
DOC-00085,P0085,185,Synthetic Owner 085,14.2201,Example Village,0.9715,Extracted,
DOC-00086,P0086,186/2,Synthetic Owner 086,14.2201,Example Village,0.9539,Extracted,
DOC-00087,P0087,187,Synthetic Owner 087,15.3577,Example Village,0.7638,Extracted,Area mismatch
DOC-00088,P0088,188,Synthetic Owner 088,14.2201,Example Village,0.94,Extracted,
DOC-00089,P0089,189,Synthetic Owner 089,14.2201,Example Village,0.9943,Extracted,
DOC-00090,P0090,190,Synthetic Owner 090,14.2201,Example Village,0.957,Extracted,
DOC-00091,P0091,191/1,Synthetic Owner 091,14.2201,Example Village,0.8075,Extracted,Missing mutation information
DOC-00092,P0092,192,Synthetic Owner 092,14.2201,Example Village,0.9732,Extracted,
DOC-00093,P0093,193,Synthetic Owner 093,14.2201,Example Village,0.9795,Extracted,
DOC-00094,P0094,194,Synthetic Owner 094,14.2201,Example Village,0.9791,Extracted,
DOC-00095,P0095,195,Synthetic Owner 095,14.2201,Example Village,0.9812,Extracted,
DOC-00096,P0096,196/3,Synthetic Owner 096,14.2201,Example Village,0.959,Extracted,
DOC-00097,P0097,197,Synthetic Owner 114,14.2201,Example Village,0.4297,Needs Review,Owner mismatch
DOC-00098,P0098,198,Synthetic Owner 098,14.2201,Example Village,0.571,Needs Review,Low OCR confidence
DOC-00099,P0099,199,Synthetic Owner 099,14.2201,Example Village,0.9887,Extracted,
DOC-00100,P0100,200,Synthetic Owner 100,14.2201,Example Village,0.9672,Extracted
"""

print("Base parsing loaded.")
