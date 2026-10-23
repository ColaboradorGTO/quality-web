import React from 'react';
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import { BsFiletypePdf } from "react-icons/bs";
import { InputSearch } from '../Buttons/InputSearch';
import { ButtonHeaderTable } from '../Buttons/ButtonHeaderTable';
import { BiSolidFileTxt } from "react-icons/bi";
import { FaFileCsv } from 'react-icons/fa';

const HeaderTable = ({ 
  globalFilterValue, 
  onGlobalFilterChange, 
  handlePrint, 
  exportToExcel, 
  exportToPDF, 
  exportTXT,
  exportTXTPonto,
  exportCSV 
}) => {
  return (
    <div
      className="row col-sm-6 col-md-12"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: "space-between"
      }}>


      <InputSearch
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
        placeholder="Pesquisar"

      />
 
      <div style={{ display: "flex",  justifyContent: "space-around" }}>
        {handlePrint && (
          <ButtonHeaderTable
            Icon={MdOutlineLocalPrintshop}
            iconSize={18}
            onClickButtonType={handlePrint}
            cor="primary"
          />
        )}

        {exportToExcel && (
          <ButtonHeaderTable
            Icon={SiMicrosoftexcel}
            iconSize={18}
            onClickButtonType={exportToExcel}
            cor="success"
          />
        )}

        {exportToPDF && (
          <ButtonHeaderTable
            Icon={BsFiletypePdf}
            iconSize={18}
            onClickButtonType={exportToPDF}
            cor="warning"
          />
        )}

        {exportTXT && (
          <ButtonHeaderTable
            Icon={BiSolidFileTxt}
            iconSize={18}
            onClickButtonType={exportTXT}
            cor="info"
          />
        )}
       
        {exportTXTPonto && (
          <ButtonHeaderTable
            Icon={BiSolidFileTxt}
            iconSize={18}
            onClickButtonType={exportTXTPonto}
            cor="danger"
          />
        )}
       
        {exportCSV && (
          <ButtonHeaderTable
            Icon={FaFileCsv}
            iconSize={18}
            onClickButtonType={exportCSV}
            cor="success"
          />
        )}
      </div>
    </div>
  );
};

export default HeaderTable;
