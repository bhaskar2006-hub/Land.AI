from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class MasterState(Base):
    __tablename__ = "master_states"

    state_code = Column(String(10), primary_key=True)
    state_name = Column(String(100), nullable=False)
    state_name_local = Column(String(150), nullable=True)
    language_code = Column(String(10), default="en")

    districts = relationship("MasterDistrict", back_populates="state", cascade="all, delete-orphan")

class MasterDistrict(Base):
    __tablename__ = "master_districts"

    district_code = Column(String(20), primary_key=True)
    district_name = Column(String(100), nullable=False)
    state_code = Column(String(10), ForeignKey("master_states.state_code"), nullable=False)
    district_name_local = Column(String(150), nullable=True)

    state = relationship("MasterState", back_populates="districts")
    tehsils = relationship("MasterTehsil", back_populates="district", cascade="all, delete-orphan")

class MasterTehsil(Base):
    __tablename__ = "master_tehsils"

    tehsil_code = Column(String(30), primary_key=True)
    tehsil_name = Column(String(100), nullable=False)
    district_code = Column(String(20), ForeignKey("master_districts.district_code"), nullable=False)
    tehsil_name_local = Column(String(150), nullable=True)

    district = relationship("MasterDistrict", back_populates="tehsils")
    villages = relationship("MasterVillage", back_populates="tehsil", cascade="all, delete-orphan")

class MasterVillage(Base):
    __tablename__ = "master_villages"

    village_code = Column(String(40), primary_key=True)
    village_name = Column(String(100), nullable=False)
    tehsil_code = Column(String(30), ForeignKey("master_tehsils.tehsil_code"), nullable=False)
    village_name_local = Column(String(150), nullable=True)
    pin_code = Column(String(10), nullable=True)

    tehsil = relationship("MasterTehsil", back_populates="villages")
